import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase client that reads/writes session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write updated cookies back to both the request and response
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

  // Refresh session if expired — MUST use getUser() not getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isTalentDashboard = pathname.startsWith('/talent/dashboard')
  const isEmployerDashboard = pathname.startsWith('/employer/dashboard')
  const isProtected = isTalentDashboard || isEmployerDashboard

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/gateway', request.url))
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const wrongPortal =
      (isTalentDashboard && profile?.role === 'employer') ||
      (isEmployerDashboard && profile?.role === 'talent')

    if (wrongPortal) {
      return NextResponse.redirect(new URL('/gateway', request.url))
    }
  }

  // IMPORTANT: return supabaseResponse (not NextResponse.next()) so that
  // refreshed session cookies are forwarded to the browser
  return supabaseResponse
}

export const config = {
  matcher: [
    '/talent/dashboard/:path*',
    '/employer/dashboard/:path*',
  ],
}
