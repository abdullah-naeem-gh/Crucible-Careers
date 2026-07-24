import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { computeExperienceYears } from '@/lib/shared/experienceYears'
import { getTalentVector, scoreJobsForTalent } from '@/lib/shared/matching/matchScore'
import type { TalentExperience } from '@/types/talent/profile'

const MAX_HISTORY_MESSAGES = 16
const MAX_JOBS_IN_PROMPT = 40

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function buildSystemPrompt(profileSummary: string, jobsSummary: string): string {
  return `You are Crucible AI, a friendly and knowledgeable career assistant built into the Crucible Careers job platform. You're chatting directly with a talent (job-seeker) user.

You have been given two pieces of context below: the user's own profile summary, and a list of currently active job postings on Crucible. Use them naturally in conversation — don't just dump them back at the user.

THEIR PROFILE:
${profileSummary}

CURRENTLY ACTIVE JOBS ON CRUCIBLE (a pre-filtered subset most relevant to their skills):
${jobsSummary}

How to behave:
- If asked something like "what jobs should I apply to" or "find me a good match," recommend up to 5 jobs, chosen ONLY from the job list above — never invent a job, company, or detail that isn't in that list. Rank them by how well their skills/requirements overlap with the user's profile. Put them in "recommendedJobs", each with a short one-sentence "reason" explaining specifically why that job fits this user (their skills, experience, or preferences) — the app displays that reason directly under the job's card, so it must stand alone without naming the job/company again (those already show on the card).
- When recommending jobs, keep "message" to a brief, friendly intro line only (e.g. "Here are a few roles worth a look:") — do NOT list the jobs, their names, or reasons inside "message"; that's all handled by the cards and their per-job reasons.
- If the job list above is empty or nothing is a reasonable fit, say so honestly in "message" instead of forcing recommendations, and leave "recommendedJobs" empty.
- For general career questions (resume writing, interview prep, cover letters, salary negotiation, career changes, portfolio advice, and anything else job-seekers commonly ask), answer helpfully and fully from your own general expertise in "message" — these don't need to reference the job list at all, and "recommendedJobs" should be empty.
- Never fabricate information about the Crucible platform, its jobs, or the user's own profile beyond what's given to you above.
- Your "message" text must be plain conversational text only — no markdown formatting (no #, **, bullet characters, or tables), since it's shown as-is in a plain chat bubble. Same for each "reason".
- Keep replies concise, warm, and actionable.

Respond with strict JSON only (no markdown, no commentary outside the JSON) matching exactly this shape:
{
  "message": string,
  "recommendedJobs": { "id": string, "reason": string }[]
}`
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'talent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const messages: ChatMessage[] = Array.isArray(body?.messages)
    ? body.messages.filter((m: unknown): m is ChatMessage =>
        typeof m === 'object' && m !== null &&
        (('role' in m) && ((m as any).role === 'user' || (m as any).role === 'assistant')) &&
        typeof (m as any).content === 'string'
      )
    : []

  if (messages.length === 0) {
    return NextResponse.json({ error: 'No message provided.' }, { status: 400 })
  }

  const truncatedHistory = messages.slice(-MAX_HISTORY_MESSAGES)

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('GROQ_API_KEY is not configured')
    return NextResponse.json({ error: "Couldn't respond right now." }, { status: 502 })
  }

  try {
    const { data: baseProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select(`
        headline,
        overview,
        location,
        skills,
        preferred_roles,
        work_preference,
        availability,
        talent_experiences (start_date, end_date, current),
        talent_educations (degree, field, school)
      `)
      .eq('user_id', user.id)
      .single()

    const skills: string[] = talentProfile?.skills || []
    const experienceForYears: TalentExperience[] = (talentProfile?.talent_experiences || []).map((e: any) => ({
      id: '',
      company: '',
      role: '',
      location: '',
      startDate: e.start_date || '',
      endDate: e.end_date || '',
      current: e.current || false,
      description: '',
    }))
    const yearsOfExperience = computeExperienceYears(experienceForYears)
    const educationLines = (talentProfile?.talent_educations || [])
      .map((e: any) => `${e.degree || 'Degree'} in ${e.field || 'N/A'}, ${e.school || 'N/A'}`)
      .join('; ')

    const profileSummary = [
      `Name: ${baseProfile?.first_name || ''} ${baseProfile?.last_name || ''}`.trim(),
      talentProfile?.headline ? `Headline: ${talentProfile.headline}` : null,
      talentProfile?.location ? `Location: ${talentProfile.location}` : null,
      `Skills: ${skills.length ? skills.join(', ') : 'None listed'}`,
      `Approx. years of experience: ${yearsOfExperience}`,
      educationLines ? `Education: ${educationLines}` : null,
      talentProfile?.preferred_roles?.length ? `Preferred roles: ${talentProfile.preferred_roles.join(', ')}` : null,
      talentProfile?.work_preference ? `Work preference: ${talentProfile.work_preference}` : null,
      talentProfile?.availability ? `Availability: ${talentProfile.availability}` : null,
      talentProfile?.overview ? `Overview: ${talentProfile.overview}` : null,
    ].filter(Boolean).join('\n')

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, employer_id, title, location, type, salary_range, tags, description, requirements')
      .eq('status', 'Active')
      .order('created_at', { ascending: false })

    const employerIds = Array.from(new Set((jobs || []).map((j) => j.employer_id)))
    const { data: companies } = await supabase
      .from('employer_company_names')
      .select('id, company')
      .in('id', employerIds.length ? employerIds : ['00000000-0000-0000-0000-000000000000'])
    const companyById = new Map((companies || []).map((c) => [c.id, c.company]))

    let matchScoreByJob = new Map<string, number>()
    try {
      const talentVector = await getTalentVector(user.id)
      if (talentVector) {
        matchScoreByJob = await scoreJobsForTalent(talentVector, (jobs || []).map((j) => j.id))
      }
    } catch (err) {
      console.error('Failed to compute job match scores for AI chat:', err)
    }

    const rankedJobs = (jobs || [])
      .map((job) => ({
        ...job,
        company: companyById.get(job.employer_id) || 'Unknown Company',
        matchScore: matchScoreByJob.get(job.id) ?? 0,
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, MAX_JOBS_IN_PROMPT)

    const jobsSummary = rankedJobs.length
      ? rankedJobs.map((job) => {
          const desc = (job.description || '').slice(0, 200)
          return `- id: ${job.id} | title: ${job.title} | company: ${job.company} | location: ${job.location || 'N/A'} | type: ${job.type || 'N/A'} | salary: ${job.salary_range || 'N/A'} | skills: ${(job.tags || []).join(', ') || 'N/A'} | requirements: ${(job.requirements || []).join('; ') || 'N/A'} | description: ${desc}`
        }).join('\n')
      : 'No active jobs are currently available on the platform.'

    const systemPrompt = buildSystemPrompt(profileSummary, jobsSummary)

    const groq = new Groq({ apiKey })
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...truncatedHistory.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    const raw = completion.choices[0]?.message?.content
    const parsed = raw ? JSON.parse(raw) : null

    const reply = typeof parsed?.message === 'string' ? parsed.message.trim() : ''
    if (!reply) throw new Error('Empty AI response')

    const recommendations: { id: string; reason: string }[] = Array.isArray(parsed?.recommendedJobs)
      ? parsed.recommendedJobs
          .filter((r: unknown): r is { id: unknown; reason: unknown } => typeof r === 'object' && r !== null)
          .map((r: any) => ({
            id: typeof r.id === 'string' ? r.id : '',
            reason: typeof r.reason === 'string' ? r.reason.trim() : '',
          }))
          .filter((r: { id: string; reason: string }) => r.id)
      : []

    // Never trust ids straight from the model — only ones present in the
    // candidate pool we actually gave it are allowed through to the client.
    const rankedJobById = new Map(rankedJobs.map((job) => [job.id, job]))
    const recommendedJobs = recommendations
      .map(({ id, reason }) => {
        const job = rankedJobById.get(id)
        return job ? { job, reason } : null
      })
      .filter((entry): entry is { job: NonNullable<ReturnType<typeof rankedJobById.get>>; reason: string } => !!entry)
      .slice(0, 5)
      .map(({ job, reason }) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        salary: job.salary_range,
        tags: job.tags || [],
        reason,
      }))

    return NextResponse.json({ reply, jobs: recommendedJobs })
  } catch (err) {
    console.error('Crucible AI chat request failed:', err)
    return NextResponse.json({ error: "Couldn't respond right now. Please try again." }, { status: 502 })
  }
}
