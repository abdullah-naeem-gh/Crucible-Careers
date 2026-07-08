import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/shared/supabase/server'
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

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }

    // Fetch base name from profiles table (source of truth)
    const { data: baseProfile, error: baseError } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    if (baseError) {
      console.error('Error fetching names from profiles:', baseError)
    }

    // Map database relations back to TalentProfile interface
    const mappedProfile: TalentProfile = {
      id: profile.id,
      firstName: baseProfile?.first_name || '',
      lastName: baseProfile?.last_name || '',
      headline: profile.headline || '',
      email: profile.email || '',
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
      portfolio: profile.portfolio || '',
      introVideoUrl: profile.intro_video_url || '',
      resumeFilename: profile.resume_filename || '',
      resumeUrl: profile.resume_url || '',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      experience: (profile.talent_experiences || []).map((e: any): TalentExperience => ({
        id: e.id,
        company: e.company,
        role: e.role,
        location: e.location || '',
        startDate: e.start_date || '',
        endDate: e.end_date || '',
        current: e.current || false,
        description: e.description || '',
        previousSalary: e.previous_salary || '',
        payslipVerified: e.payslip_verified || false,
      })),
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
