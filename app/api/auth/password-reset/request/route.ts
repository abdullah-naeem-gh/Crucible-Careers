import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type UserType = 'talent' | 'employer'

const resendAttempts = new Map<string, number>()
const RESEND_DELAY_SECONDS = 60

function isValidUserType(userType: unknown): userType is UserType {
  return userType === 'talent' || userType === 'employer'
}

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  const { email, userType } = await request.json()

  if (!isValidEmail(email) || !isValidUserType(userType)) {
    return NextResponse.json({ success: false, message: 'Enter a valid account email.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const attemptKey = `${userType}:${normalizedEmail}`
  const now = Date.now()
  const nextAllowedAt = resendAttempts.get(attemptKey) || 0

  if (nextAllowedAt > now) {
    return NextResponse.json(
      {
        success: false,
        message: 'Please wait before requesting another reset email.',
        retryAfter: Math.ceil((nextAllowedAt - now) / 1000)
      },
      { status: 429 }
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, message: 'Password reset is not configured.' }, { status: 500 })
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
  const redirectTo = `${origin}/auth/reset-password?userType=${userType}`
  const supabase = createClient(supabaseUrl, supabaseKey)
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo })

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 })
  }

  resendAttempts.set(attemptKey, now + RESEND_DELAY_SECONDS * 1000)

  return NextResponse.json({ success: true, email: normalizedEmail })
}
