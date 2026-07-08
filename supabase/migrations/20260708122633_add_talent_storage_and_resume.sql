-- 1. Add resume_url to talent_profiles
ALTER TABLE public.talent_profiles ADD COLUMN resume_url text;

-- 2. Create the talent-assets bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('talent-assets', 'talent-assets', true);

-- 3. Set up RLS for the bucket
-- Allow public viewing of files in the bucket
CREATE POLICY "Anyone can view talent assets" ON storage.objects FOR SELECT USING (bucket_id = 'talent-assets');

-- Allow authenticated users to upload files to their own folder (folder name must match their user UUID)
CREATE POLICY "Users can upload talent assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'talent-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update talent assets" ON storage.objects FOR UPDATE USING (bucket_id = 'talent-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete talent assets" ON storage.objects FOR DELETE USING (bucket_id = 'talent-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Notify postgrest to reload the schema
NOTIFY pgrst, 'reload schema';