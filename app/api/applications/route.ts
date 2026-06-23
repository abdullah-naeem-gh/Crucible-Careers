import { NextRequest, NextResponse } from 'next/server'

const DEMO_APPLICATIONS = [
  { id: '1', jobTitle: 'Senior Frontend Engineer', company: 'Salik Labs', appliedAt: '2024-01-15', status: 'Under Review', matchScore: 86, lastUpdated: '2 days ago' },
  { id: '2', jobTitle: 'Machine Learning Engineer', company: 'Vyro', appliedAt: '2024-01-10', status: 'Interview', matchScore: 73, lastUpdated: '1 day ago' },
  { id: '3', jobTitle: 'Backend Engineer', company: 'Systems Limited', appliedAt: '2024-01-08', status: 'Applied', matchScore: 64, lastUpdated: '5 days ago' },
  { id: '4', jobTitle: 'Product Designer', company: 'Salik Labs', appliedAt: '2024-01-05', status: 'Rejected', matchScore: 79, lastUpdated: '1 week ago' },
]

export async function GET() {
  return NextResponse.json(DEMO_APPLICATIONS)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('New application:', body)
  return NextResponse.json({ success: true, message: 'Application submitted' }, { status: 201 })
}
