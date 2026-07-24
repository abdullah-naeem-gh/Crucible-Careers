import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isSafeRedirectPath } from '@/lib/shared/safeRedirect'

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

  // Role set at signup (`signUp()` passes it as user_metadata.role, copied by
  // the handle_new_user() trigger into profiles.role) — present immediately
  // for email/password accounts. Google OAuth accounts get their role
  // written only into profiles.role (app/api/auth/set-role/route.ts also
  // syncs it back into user_metadata going forward, but accounts created
  // before that sync existed won't have it there) — fall back to a direct
  // profiles lookup so those accounts don't get misrouted to /gateway.
  let role = user?.user_metadata?.role as string | undefined
  if (user && !role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? undefined
  }

  const { pathname } = request.nextUrl

  // Already-logged-in visitors hitting a public-only page (marketing landing,
  // portal picker, or either login screen) should go straight to their
  // dashboard instead of seeing it again.
  const isPublicOnlyPage =
    pathname === '/' ||
    pathname === '/gateway' ||
    pathname === '/employer' ||
    pathname === '/talent/login' ||
    pathname === '/employer/login'

  if (isPublicOnlyPage && user) {
    if (role === 'talent' || role === 'employer') {
      // A talent user bounced off /talent/login while already signed in
      // (e.g. a stale tab, browser back button) should still land wherever
      // the login link was pointing them — an apply-form link, most often.
      const redirect = request.nextUrl.searchParams.get('redirect')
      if (pathname === '/talent/login' && role === 'talent' && isSafeRedirectPath(redirect)) {
        return NextResponse.redirect(new URL(redirect, request.url))
      }
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url))
    }
    // No role yet — /gateway is the correct place for them, don't redirect
    // to itself (that would loop forever).
    if (pathname !== '/gateway') {
      return NextResponse.redirect(new URL('/gateway', request.url))
    }
  }

  const isTalentProtected =
    pathname.startsWith('/talent/dashboard') ||
    pathname.startsWith('/talent/onboarding')
  const isEmployerProtected =
    pathname.startsWith('/employer/dashboard') ||
    pathname.startsWith('/employer/onboarding') ||
    pathname.startsWith('/employer/setup') ||
    pathname.startsWith('/employer/invitations')
  const isStaffProtected = pathname.startsWith('/staff')

  if (isTalentProtected && !user) {
    return NextResponse.redirect(new URL('/talent/login', request.url))
  }
  if (isEmployerProtected && !user) {
    return NextResponse.redirect(new URL('/employer/login', request.url))
  }
  if (isStaffProtected && !user) {
    return NextResponse.redirect(new URL('/gateway', request.url))
  }

  // A talent account must not be able to reach employer routes by editing
  // the URL, and vice versa.
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
    '/',
    '/gateway',
    '/employer',
    '/talent/login',
    '/employer/login',
    '/talent/dashboard/:path*',
    '/employer/dashboard/:path*',
    '/talent/onboarding/:path*',
    '/employer/onboarding/:path*',
    '/employer/setup/:path*',
    '/employer/invitations/:path*',
    '/staff/:path*',
  ],
}
