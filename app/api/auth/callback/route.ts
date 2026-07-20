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
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
      // If this exchange just attached/refreshed a GitHub identity (e.g. via
      // linkIdentity() from the talent Profile tab), sync the verified
      // username server-side right here — more reliable than having the
      // client detect a redirect query param and fire a follow-up request.
      const { data: { user } } = await supabase.auth.getUser()
      const githubIdentity = user?.identities?.find((identity) => identity.provider === 'github')
      if (user && githubIdentity && user.user_metadata?.role === 'talent') {
        const identityData = githubIdentity.identity_data as Record<string, unknown> | undefined
        const username = (identityData?.user_name || identityData?.preferred_username || identityData?.login) as string | undefined
        if (username) {
          // A plain update() only touches the columns listed here — unlike
          // upsert(), which resets every column absent from the payload back
          // to null on conflict and would wipe the rest of the profile.
          const { data: updated } = await supabase
            .from('talent_profiles')
            .update({ github_verified_username: username, github_verified_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .select('user_id')
          if (!updated || updated.length === 0) {
            await supabase
              .from('talent_profiles')
              .insert({ user_id: user.id, github_verified_username: username, github_verified_at: new Date().toISOString() })
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      // Pass the error message to the auth error page
      return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
    }
  }

  // return the user to an error page with some instructions if no code is present
  return NextResponse.redirect(`${origin}/auth/auth-error?error=Invalid%20or%20missing%20token`)
}

