import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { snapshotOf } from '@/lib/talent/services/experienceSnapshot'
import type { TalentProfile } from '@/types/talent/profile'

const normalizeCompany = (s?: string) => (s || '').trim().toLowerCase()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Avoid logging user metadata (PII) in server logs

    const payload: TalentProfile = await request.json()

    // 1. Update first/last name in the profiles table (source of truth)
    const fallbackFirstName = user.user_metadata?.first_name || user.user_metadata?.name?.split(' ')[0] || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Anonymous'
    const fallbackLastName = user.user_metadata?.last_name || user.user_metadata?.name?.split(' ').slice(1).join(' ') || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
    
    if (payload.firstName || payload.lastName) {
      const { error: baseError } = await supabase
        .from('profiles')
        .update({ 
           first_name: payload.firstName || fallbackFirstName,
           last_name: payload.lastName || fallbackLastName
        })
        .eq('id', user.id)
      
      if (baseError) {
        console.error('Error updating first/last name in profiles:', baseError)
      }
    }

    // If the free-text GitHub link is being changed, the verified badge no
    // longer reflects it — clear it server-side rather than trusting whatever
    // the client happens to send, since formState.github and
    // formState.githubVerifiedUsername are edited independently on the client.
    const { data: existingProfile } = await supabase
      .from('talent_profiles')
      .select('github, github_verified_username')
      .eq('user_id', user.id)
      .single()

    const githubLinkChanged = !!existingProfile?.github_verified_username && existingProfile.github !== (payload.github || '')
    const githubVerifiedUsername = githubLinkChanged ? null : (payload.githubVerifiedUsername ?? null)
    const githubVerifiedAt = githubLinkChanged ? null : (payload.githubVerifiedAt ?? null)

    if (githubLinkChanged) {
      try {
        const { data: identitiesData } = await supabase.auth.getUserIdentities()
        const githubIdentity = identitiesData?.identities.find((identity) => identity.provider === 'github')
        if (githubIdentity) {
          const { error: unlinkError } = await supabase.auth.unlinkIdentity(githubIdentity)
          // Supabase refuses to unlink a user's only identity (they'd be locked
          // out) — that's fine, just leave it linked; our own verified fields
          // are already cleared above regardless.
          if (unlinkError) console.error('Failed to unlink GitHub identity:', unlinkError)
        }
      } catch (err) {
        console.error('Failed to unlink GitHub identity:', err)
      }
    }

    // 2. Upsert Talent Profile
    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .upsert({
        user_id: user.id,
        headline: payload.headline,
        email: payload.email || user.email || '',
        location: payload.location,
        photo_url: payload.photoUrl,
        overview: payload.overview,
        availability: payload.availability,
        work_preference: payload.workPreference,
        preferred_roles: payload.preferredRoles,
        skills: payload.skills,
        languages: payload.languages,
        hourly_rate: payload.hourlyRate,
        linkedin: payload.linkedin,
        github: payload.github,
        // Supabase's upsert() resets any column not present in this payload
        // back to null on conflict (it isn't a scoped partial update) — these
        // two are managed exclusively by the GitHub verification flow, so we
        // must round-trip whatever the client currently has to avoid wiping it.
        github_verified_username: githubVerifiedUsername,
        github_verified_at: githubVerifiedAt,
        portfolio: payload.portfolio,
        intro_video_url: payload.introVideoUrl,
        resume_filename: payload.resumeFilename,
        resume_url: payload.resumeUrl,
      }, { onConflict: 'user_id' })
      .select('id')
      .single()

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      return NextResponse.json({ error: 'Failed to save profile', details: profileError }, { status: 500 })
    }

    const profileId = profile.id

    // Snapshot pre-save state needed to decide which experiences should
    // trigger a fresh employer-verification request, before it's wiped by
    // the delete-all-then-reinsert below.
    const { data: previousExperiences } = await supabase
      .from('talent_experiences')
      .select('id, company')
      .eq('profile_id', profileId)
    const previousCompanyById = new Map((previousExperiences ?? []).map((e) => [e.id, e.company]))

    const { data: existingVerifications } = await supabase
      .from('talent_experience_verifications')
      .select('*')
      .eq('talent_id', user.id)
    const verificationByExperienceId = new Map((existingVerifications ?? []).map((v) => [v.experience_id, v]))

    const { data: employerNames } = await supabase.from('employer_company_names').select('id, company')
    const employerIdByName = new Map<string, string>()
    for (const row of employerNames ?? []) {
      const key = normalizeCompany(row.company)
      if (key && !employerIdByName.has(key)) employerIdByName.set(key, row.id)
    }

    const { data: blacklistRows } = await supabase
      .from('employer_talent_blacklist')
      .select('employer_id')
      .eq('talent_id', user.id)
    const blacklistedEmployerIds = new Set((blacklistRows ?? []).map((b) => b.employer_id))

    // 2. Diff and Upsert Experiences
    // Safer than constructing an `in.(...)` filter from client-provided IDs.
    await supabase.from('talent_experiences').delete().eq('profile_id', profileId)

    const validExperiences = (payload.experience ?? []).filter(e => e.company?.trim() || e.role?.trim())

    if (validExperiences.length > 0) {
      const expRows = validExperiences.map(e => ({
        id: e.id,
        profile_id: profileId,
        company: e.company || 'Unknown Company',
        role: e.role || 'Unknown Role',
        location: e.location,
        start_date: e.startDate,
        end_date: e.endDate,
        current: e.current,
        description: e.description,
        previous_salary: e.previousSalary,
      }))
      const { error: expError } = await supabase.from('talent_experiences').upsert(expRows)
      if (expError) console.error('Error upserting experiences:', expError)
    }

    // 2b. Recompute experience-verification requests. talent_experiences was
    // just delete-all-then-reinserted above, which cascade-deletes every
    // talent_experience_verifications row tied to it (ON DELETE CASCADE) —
    // so untouched requests (pending/verified/rejected-unchanged) must be
    // explicitly rewritten here too, not just the ones that change state.
    if (validExperiences.length > 0) {
      const admin = createSupabaseAdminClient()
      const rowsToInsert: Record<string, unknown>[] = []

      for (const e of validExperiences) {
        const prevCompany = previousCompanyById.get(e.id)
        const isNewId = prevCompany === undefined
        const companyChanged = !isNewId && normalizeCompany(prevCompany) !== normalizeCompany(e.company)
        const employerId = employerIdByName.get(normalizeCompany(e.company))
        const existing = verificationByExperienceId.get(e.id)
        const isBlacklisted = !!employerId && blacklistedEmployerIds.has(employerId)

        if (employerId && !isBlacklisted && (isNewId || companyChanged || !existing)) {
          // First contact with this employer for this experience row — fresh pending request.
          rowsToInsert.push({
            id: crypto.randomUUID(),
            experience_id: e.id,
            talent_id: user.id,
            employer_id: employerId,
            status: 'pending',
            rejection_reason: null,
            snapshot: snapshotOf(e),
            requested_at: new Date().toISOString(),
            responded_at: null,
            talent_acknowledged_at: null,
          })
        } else if (companyChanged && existing && (!employerId || isBlacklisted)) {
          // Moved away from a previously-registered employer to an
          // unregistered/blacklisted one — drop the stale request entirely.
        } else if (existing && !isNewId && !companyChanged) {
          // Company is unchanged — only the company field auto-(re)sends a
          // request. Edits to any other field (role, dates, description,
          // etc.) never auto-send, including after a rejection; the talent
          // must explicitly hit "Resend" for that. Preserve as-is, whatever
          // the current status — crucially INCLUDING the original `id`,
          // since the delete-all-then-reinsert below would otherwise mint a
          // fresh id on every save and orphan any `verificationRequestId`
          // the client is already holding (breaking the Resend button).
          rowsToInsert.push({
            id: existing.id,
            experience_id: existing.experience_id,
            talent_id: existing.talent_id,
            employer_id: existing.employer_id,
            status: existing.status,
            rejection_reason: existing.rejection_reason,
            snapshot: existing.snapshot,
            requested_at: existing.requested_at,
            responded_at: existing.responded_at,
            talent_acknowledged_at: existing.talent_acknowledged_at,
          })
        }
      }

      await admin.from('talent_experience_verifications').delete().eq('talent_id', user.id)
      if (rowsToInsert.length > 0) {
        const { error: verError } = await admin.from('talent_experience_verifications').insert(rowsToInsert)
        if (verError) console.error('Error upserting experience verifications:', verError)
      }
    } else {
      const admin = createSupabaseAdminClient()
      await admin.from('talent_experience_verifications').delete().eq('talent_id', user.id)
    }

    // 3. Diff and Upsert Educations
    // Safer than constructing an `in.(...)` filter from client-provided IDs.
    await supabase.from('talent_educations').delete().eq('profile_id', profileId)

    if (payload.education?.length) {
      const validEducations = payload.education.filter(e => e.school?.trim() || e.degree?.trim())
      if (validEducations.length > 0) {
        const eduRows = validEducations.map(e => ({
          id: e.id,
          profile_id: profileId,
          school: e.school || 'Unknown School',
          degree: e.degree,
          field: e.field,
          start_year: e.startYear,
          end_year: e.endYear,
          description: e.description,
        }))
        const { error: eduError } = await supabase.from('talent_educations').upsert(eduRows)
        if (eduError) console.error('Error upserting educations:', eduError)
      }
    }

    // 4. Diff and Upsert Projects
    // Safer than constructing an `in.(...)` filter from client-provided IDs.
    await supabase.from('talent_projects').delete().eq('profile_id', profileId)

    if (payload.projects?.length) {
      const validProjects = payload.projects.filter(p => p.title?.trim())
      if (validProjects.length > 0) {
        const projRows = validProjects.map(p => ({
          id: p.id,
          profile_id: profileId,
          title: p.title || 'Untitled Project',
          description: p.description,
          link: p.link,
          image_url: p.imageUrl,
          video_url: p.videoUrl,
        }))
        const { error: projError } = await supabase.from('talent_projects').upsert(projRows)
        if (projError) console.error('Error upserting projects:', projError)
      }
    }

    return NextResponse.json({ success: true, profileId })
  } catch (error: any) {
    console.error('Error processing onboarding:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message || error }, { status: 500 })
  }
}
