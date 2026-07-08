-- 1. Create employer_profiles table
CREATE TABLE IF NOT EXISTS public.employer_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  tagline text,
  industry text,
  company_size text,
  founded text,
  website text,
  headquarters text,
  overview text,
  culture text,
  benefits text,
  tech_stack text,
  linkedin text,
  twitter text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly (least privilege)
REVOKE ALL ON TABLE public.employer_profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.employer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.employer_profiles TO authenticated;
GRANT ALL ON TABLE public.employer_profiles TO service_role;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.employer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.employer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.employer_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- Create a trigger function to update the updated_at timestamp
CREATE TRIGGER update_employer_profiles_updated_at
  BEFORE UPDATE ON public.employer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. Create the employer-assets bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('employer-assets', 'employer-assets', true);

-- 3. Set up RLS for the bucket
-- Allow public viewing of files in the bucket
CREATE POLICY "Anyone can view employer assets" ON storage.objects FOR SELECT USING (bucket_id = 'employer-assets');

-- Allow authenticated users to upload files to their own folder (folder name must match their user UUID)
CREATE POLICY "Users can upload employer assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'employer-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update employer assets" ON storage.objects FOR UPDATE USING (bucket_id = 'employer-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete employer assets" ON storage.objects FOR DELETE USING (bucket_id = 'employer-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Notify postgrest to reload the schema
NOTIFY pgrst, 'reload schema';
