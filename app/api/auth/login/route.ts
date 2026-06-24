import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, userType } = await request.json()
  console.log('Sign-in:', { email, password, userType })
  return NextResponse.json({
    success: true,
    token: `demo-token-${Date.now()}`,
    user: { email, userType },
  })
}
