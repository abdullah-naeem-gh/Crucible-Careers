import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('Sign-up:', body)
  return NextResponse.json({ success: true, message: 'Account created' })
}
