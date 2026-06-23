import { NextRequest, NextResponse } from 'next/server'

const DEMO_APPLICANTS = [
  { id: 'a1', name: 'Matthew Brown', initials: 'MB', location: 'New York, US-NY', source: 'Indeed', rating: 4, match: 78, status: 'In-review', label: 'Interview', atsScore: 72, crucibleScore: 80 },
  { id: 'a2', name: 'Melissa Salazar', initials: 'MS', location: 'New York, US-NY', source: 'Indeed', rating: 3, match: 73, status: 'In-review', atsScore: 65, crucibleScore: 74 },
  { id: 'a3', name: 'Emily Morgan', initials: 'EM', location: 'New York, US-NY', source: 'Indeed', rating: 5, match: 88, status: 'Interview', label: 'Selected', atsScore: 90, crucibleScore: 92 },
  { id: 'a4', name: 'Paul Rodgers', initials: 'PR', location: 'New York, US-NY', source: 'Indeed', rating: 2, match: 66, status: 'New', atsScore: 55, crucibleScore: 60 },
]

export async function GET() {
  return NextResponse.json(DEMO_APPLICANTS)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('New applicant:', body)
  return NextResponse.json({ success: true, message: 'Applicant added' }, { status: 201 })
}
