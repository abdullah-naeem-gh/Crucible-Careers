import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase client that reads/writes session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  const isTalentProtected =
    pathname.startsWith('/talent/dashboard') ||
    pathname.startsWith('/talent/onboarding')
  const isEmployerProtected =
    pathname.startsWith('/employer/dashboard') ||
    pathname.startsWith('/employer/onboarding')

  if (isTalentProtected && !user) {
    return NextResponse.redirect(new URL('/talent/login', request.url))
  }
  if (isEmployerProtected && !user) {
    return NextResponse.redirect(new URL('/employer/login', request.url))
  }

  // Role set at signup (`signUp()` passes it as user_metadata.role, copied by
  // the handle_new_user() trigger into profiles.role) — a talent account must
  // not be able to reach employer routes by editing the URL, and vice versa.
  const role = user?.user_metadata?.role as string | undefined

  if (isTalentProtected && role && role !== 'talent') {
    return NextResponse.redirect(new URL(role === 'employer' ? '/employer/dashboard' : '/gateway', request.url))
  }
  if (isEmployerProtected && role && role !== 'employer') {
    return NextResponse.redirect(new URL(role === 'talent' ? '/talent/dashboard' : '/gateway', request.url))
  }

  // IMPORTANT: return supabaseResponse (not NextResponse.next()) so that
  // refreshed session cookies are forwarded to the browser
  return supabaseResponse
}

export const config = {
  matcher: [
    '/talent/dashboard/:path*',
    '/employer/dashboard/:path*',
    '/talent/onboarding/:path*',
    '/employer/onboarding/:path*',
  ],
}
