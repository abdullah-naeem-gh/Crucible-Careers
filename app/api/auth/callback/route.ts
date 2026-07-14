import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect route
  const next = searchParams.get('next') ?? '/auth/verified'

  if (tokenHash || code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    // Prefer token_hash verification when the email template provides one —
    // it validates directly against Supabase without needing the PKCE
    // code_verifier cookie that exchangeCodeForSession() requires, so it
    // isn't broken by the extra redirect hop through Supabase's hosted
    // verify endpoint (same approach already used by ResetPasswordPage.tsx).
    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type ?? 'signup' })
      : await supabase.auth.exchangeCodeForSession(code as string)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // Pass the error message to the auth error page
      return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // return the user to an error page with some instructions if no code is present
  return NextResponse.redirect(`${origin}/auth/auth-error?error=Invalid%20or%20missing%20token`)
}

