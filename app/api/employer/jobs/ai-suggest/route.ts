import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'

const SYSTEM_PROMPT = `You are a professional job-post writer helping an employer draft a job listing.
Given only a job title, respond with strict JSON (no markdown, no commentary) matching exactly this shape:
{
  "description": string, // 2-4 sentence overview paragraph of the role
  "responsibilities": string[], // 4-6 concise sentences, no leading bullet characters or numbering
  "requirements": string[], // 4-6 concise sentences, no leading bullet characters or numbering
  "tags": string[] // 4-8 short skill/technology/keyword tags relevant to the role, each 1-3 words, no leading "#" or punctuation
}`

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''

  if (!title) {
    return NextResponse.json({ error: 'Job title is required.' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured')
    return NextResponse.json({ error: "Couldn't generate suggestions right now." }, { status: 502 })
  }

  try {
    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Job title: ${title}` },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    const parsed = raw ? JSON.parse(raw) : null

    const description = typeof parsed?.description === 'string' ? parsed.description.trim() : ''
    const responsibilities = Array.isArray(parsed?.responsibilities)
      ? parsed.responsibilities.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    const requirements = Array.isArray(parsed?.requirements)
      ? parsed.requirements.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : []
    const tags = Array.isArray(parsed?.tags)
      ? parsed.tags.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
      : []

    if (!description && responsibilities.length === 0 && requirements.length === 0 && tags.length === 0) {
      throw new Error('Empty or malformed AI response')
    }

    return NextResponse.json({ description, responsibilities, requirements, tags })
  } catch (err) {
    console.error('Groq job-suggestion request failed:', err)
    return NextResponse.json({ error: "Couldn't generate suggestions right now." }, { status: 502 })
  }
}
