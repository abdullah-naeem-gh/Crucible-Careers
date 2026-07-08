-- Add the new columns
ALTER TABLE public.talent_profiles ADD COLUMN first_name text NOT NULL DEFAULT '';
ALTER TABLE public.talent_profiles ADD COLUMN last_name text NOT NULL DEFAULT '';

-- Migrate existing data by splitting the current name on the first space
UPDATE public.talent_profiles
SET 
  first_name = split_part(name, ' ', 1),
  last_name = substr(name, length(split_part(name, ' ', 1)) + 2);

-- Drop the old column
ALTER TABLE public.talent_profiles DROP COLUMN name;

-- Notify postgrest to reload the schema cache so APIs immediately reflect the change
NOTIFY pgrst, 'reload schema';