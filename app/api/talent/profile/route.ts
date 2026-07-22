import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
import { createSupabaseAdminClient } from '@/lib/shared/supabase/admin'
import { snapshotOf, snapshotsEqual, type ExperienceSnapshot } from '@/lib/talent/services/experienceSnapshot'
import type { TalentProfile, TalentExperience, TalentEducation, TalentProject } from '@/types/talent/profile'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        talent_experiences (*),
        talent_educations (*),
        talent_projects (*)
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is no rows found
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Fetch base name from profiles table (source of truth) — populated at
    // signup, so it must be available even before talent_profiles exists.
    const { data: baseProfile, error: baseError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    if (baseError) {
      console.error('Error fetching names from profiles:', baseError)
    }

    if (!profile) {
      return NextResponse.json({
        profile: null,
        firstName: baseProfile?.first_name || '',
        lastName: baseProfile?.last_name || '',
      }, { status: 200 })
    }

    const { data: verifications } = await supabase
      .from('talent_experience_verifications')
      .select('id, experience_id, status, rejection_reason, requested_at, snapshot, employer_id')
      .eq('talent_id', user.id)
    const verificationByExperienceId = new Map((verifications ?? []).map((v) => [v.experience_id, v]))

    // employer_talent_blacklist RLS only lets the employer read their own
    // rows (a talent shouldn't normally see they're blacklisted), but the
    // badge needs to say so explicitly once rejected — so this one read has
    // to go through the admin client rather than the session-scoped one.
    const admin = createSupabaseAdminClient()
    const { data: blacklistRows } = await admin
      .from('employer_talent_blacklist')
      .select('employer_id')
      .eq('talent_id', user.id)
    const blacklistedEmployerIds = new Set((blacklistRows ?? []).map((b) => b.employer_id))

    // Map database relations back to TalentProfile interface
    const mappedProfile: TalentProfile = {
      id: profile.id,
      firstName: baseProfile?.first_name || '',
      lastName: baseProfile?.last_name || '',
      headline: profile.headline || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      photoUrl: profile.photo_url || null,
      overview: profile.overview || '',
      availability: profile.availability || '',
      workPreference: profile.work_preference || '',
      preferredRoles: profile.preferred_roles || [],
      skills: profile.skills || [],
      languages: profile.languages || [],
      hourlyRate: profile.hourly_rate || '',
      linkedin: profile.linkedin || '',
      github: profile.github || '',
      githubVerifiedUsername: profile.github_verified_username || undefined,
      githubVerifiedAt: profile.github_verified_at || undefined,
      portfolio: profile.portfolio || '',
      introVideoUrl: profile.intro_video_url || '',
      resumeFilename: profile.resume_filename || '',
      resumeUrl: profile.resume_url || '',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      experience: (profile.talent_experiences || []).map((e: any): TalentExperience => {
        const verification = verificationByExperienceId.get(e.id)
        const canResendAfterEdit = verification?.status === 'rejected'
          ? !snapshotsEqual(verification.snapshot as ExperienceSnapshot, snapshotOf({
              role: e.role,
              location: e.location,
              startDate: e.start_date,
              endDate: e.end_date,
              current: e.current,
              description: e.description,
            }))
          : undefined
        return {
          id: e.id,
          company: e.company,
          role: e.role,
          location: e.location || '',
          startDate: e.start_date || '',
          endDate: e.end_date || '',
          current: e.current || false,
          description: e.description || '',
          previousSalary: e.previous_salary || '',
          verificationStatus: verification?.status || 'none',
          verificationRequestId: verification?.id || undefined,
          verificationRejectionReason: verification?.rejection_reason || undefined,
          verificationRequestedAt: verification?.requested_at || undefined,
          verificationCanResend: canResendAfterEdit,
          verificationBlacklisted: verification ? blacklistedEmployerIds.has(verification.employer_id) : undefined,
        }
      }),
      education: (profile.talent_educations || []).map((e: any): TalentEducation => ({
        id: e.id,
        school: e.school,
        degree: e.degree || '',
        field: e.field || '',
        startYear: e.start_year || '',
        endYear: e.end_year || '',
        description: e.description || '',
      })),
      projects: (profile.talent_projects || []).map((p: any): TalentProject => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        link: p.link || '',
        imageUrl: p.image_url || null,
        videoUrl: p.video_url || '',
      })),
    }

    return NextResponse.json({ profile: mappedProfile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
