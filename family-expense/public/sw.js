const CACHE_NAME = 'family-expense-v1'

// 安裝時預快取 App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/login',
        '/dashboard',
        '/offline',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ])
    )
  )
  self.skipWaiting()
})

// 啟用時清除舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch 策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只攔截同源請求
  if (url.origin !== location.origin) return

  // API / Supabase 請求：永遠走網路
  if (url.pathname.startsWith('/api') || request.headers.get('x-supabase-key')) return

  // 導航請求（HTML 頁面）：Network First，失敗回傳 /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline').then((r) => r ?? Response.error()))
    )
    return
  }

  // 靜態資源（_next/static、icons）：Cache First
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }
})
