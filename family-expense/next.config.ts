import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // 防止點擊劫持
          { key: 'X-Frame-Options', value: 'DENY' },
          // 防止 MIME 類型嗅探
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // 嚴格 HTTPS（Vercel 已強制，此為額外層）
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // 防止 Referrer 洩漏
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 限制瀏覽器功能（不需要攝影機、麥克風等）
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP：限制資源來源
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isProd
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval only in dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://lh3.googleusercontent.com", // Google 頭像
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
              "frame-ancestors 'none'",
              "worker-src 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
