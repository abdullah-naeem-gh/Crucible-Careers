-- Create talent_profiles table
CREATE TABLE public.talent_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name text NOT NULL,
  headline text,
  email text,
  location text,
  photo_url text,
  overview text,
  availability text,
  work_preference text,
  preferred_roles text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  hourly_rate text,
  linkedin text,
  github text,
  portfolio text,
  intro_video_url text,
  resume_filename text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create talent_experiences table
CREATE TABLE public.talent_experiences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.talent_profiles(id) ON DELETE CASCADE NOT NULL,
  company text NOT NULL,
  role text NOT NULL,
  location text,
  start_date text,
  end_date text,
  current boolean DEFAULT false,
  description text,
  previous_salary text,
  payslip_verified boolean DEFAULT false
);

-- Create talent_educations table
CREATE TABLE public.talent_educations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.talent_profiles(id) ON DELETE CASCADE NOT NULL,
  school text NOT NULL,
  degree text,
  field text,
  start_year text,
  end_year text,
  description text
);

-- Create talent_projects table
CREATE TABLE public.talent_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES public.talent_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  link text,
  image_url text,
  video_url text
);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to talent_profiles
CREATE TRIGGER update_talent_profiles_updated_at
  BEFORE UPDATE ON public.talent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_projects ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies allowing authenticated users to manage their own profiles
CREATE POLICY "Users can view their own profile."
  ON public.talent_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile."
  ON public.talent_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile."
  ON public.talent_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile."
  ON public.talent_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Experience policies
CREATE POLICY "Users can view their own experiences."
  ON public.talent_experiences FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert their own experiences."
  ON public.talent_experiences FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own experiences."
  ON public.talent_experiences FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own experiences."
  ON public.talent_experiences FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- Education policies
CREATE POLICY "Users can view their own educations."
  ON public.talent_educations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert their own educations."
  ON public.talent_educations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own educations."
  ON public.talent_educations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own educations."
  ON public.talent_educations FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

-- Project policies
CREATE POLICY "Users can view their own projects."
  ON public.talent_projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert their own projects."
  ON public.talent_projects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can update their own projects."
  ON public.talent_projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete their own projects."
  ON public.talent_projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.talent_profiles WHERE id = profile_id AND user_id = auth.uid()));
