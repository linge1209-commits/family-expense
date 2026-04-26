import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 公開路徑（不需登入）
  const publicPaths = ['/login']
  const isPublic = publicPaths.some(p => pathname.startsWith(p))

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && pathname === '/login') {
    // 已登入就不用看登入頁
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (user && !isPublic) {
    // email 必須存在且格式合理
    const email = user.email ?? ''
    if (!email || email.length > 254 || !email.includes('@')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=not_authorized', request.url))
    }

    // 快取：若驗證 cookie 與目前 email 相符，跳過 DB 查詢（節省一次 Supabase roundtrip）
    const FM_COOKIE = 'fm_v'
    const fmCookie = request.cookies.get(FM_COOKIE)

    if (fmCookie?.value !== email) {
      // Cookie 不存在或 email 不符，重新查詢白名單
      const { data: member } = await supabase
        .from('family_members')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!member) {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL('/login?error=not_authorized', request.url)
        )
      }

      // 驗證成功，寫入 cookie（1 小時有效）
      supabaseResponse.cookies.set(FM_COOKIE, email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600,
        path: '/',
      })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|manifest.json).*)',
  ],
}
