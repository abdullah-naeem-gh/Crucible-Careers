import { NextRequest, NextResponse } from 'next/server'

const DEMO_JOBS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Full-time',
    salary: '$130k - $160k',
    tags: ['React', 'TypeScript', 'Tailwind', 'Vite'],
    postedAt: '2 days ago',
    description: 'Build delightful, high-performance web experiences used by thousands of professionals every day.',
    responsibilities: ['Own features end-to-end with product and design', 'Ship accessible, performant UI with robust testing', 'Mentor teammates and raise the technical bar'],
    requirements: ['5+ years in modern frontend', 'Expert in React and TypeScript', 'Strong product/design collaboration'],
    matchScore: 86,
  },
  {
    id: '2',
    title: 'Machine Learning Engineer',
    company: 'Vyro',
    location: 'Hybrid — Dubai',
    type: 'Full-time',
    salary: '$100k - $140k',
    tags: ['Python', 'PyTorch', 'LLMs', 'Ops'],
    postedAt: '5 days ago',
    description: 'Productionize ML systems powering next-gen creator tools.',
    responsibilities: ['Train and evaluate foundation models', 'Build robust data + experiment pipelines', 'Deploy low-latency inference services'],
    requirements: ['3+ years in ML', 'Experience with GPUs and model serving', 'MLOps fundamentals'],
    matchScore: 73,
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'Systems Limited',
    location: 'Onsite — Lahore',
    type: 'Full-time',
    salary: 'PKR 600k - 900k/mo',
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
    postedAt: '1 day ago',
    description: 'Design resilient APIs and services for enterprise clients.',
    responsibilities: ['Own service domains', 'Improve reliability and observability', 'Collaborate cross-functionally'],
    requirements: ['4+ years backend experience', 'SQL mastery', 'Solid systems thinking'],
    matchScore: 64,
  },
  {
    id: '4',
    title: 'Product Designer',
    company: 'Salik Labs',
    location: 'Remote',
    type: 'Contract',
    salary: '$70 - $110/hr',
    tags: ['Product Design', 'Figma', 'Design Systems'],
    postedAt: '8 days ago',
    description: 'Craft elegant experiences across the product surface area.',
    responsibilities: ['Own flows end-to-end', 'Partner with eng for quality', 'Run discovery with users'],
    requirements: ['Strong portfolio', 'Systems mindset', 'Excellent collaboration'],
    matchScore: 79,
  },
]

export async function GET() {
  return NextResponse.json(DEMO_JOBS)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const job = { id: String(Date.now()), ...body }
  console.log('New job:', job)
  return NextResponse.json(job, { status: 201 })
}
