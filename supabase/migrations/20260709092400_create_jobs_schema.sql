CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    location TEXT,
    location_type TEXT CHECK (location_type IN ('On-Site', 'Remote', 'Hybrid')),
    type TEXT CHECK (type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    status TEXT CHECK (status IN ('Draft', 'Active', 'Paused', 'Closed')),
    salary_range TEXT,
    tags TEXT[],
    description TEXT,
    responsibilities TEXT[],
    requirements TEXT[],
    form_config JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly
REVOKE ALL ON TABLE public.jobs FROM anon, authenticated;
GRANT SELECT ON TABLE public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.jobs TO authenticated;
GRANT ALL ON TABLE public.jobs TO service_role;

-- Policies
CREATE POLICY "Employers can manage their own jobs" ON public.jobs
    FOR ALL
    USING (employer_id = auth.uid())
    WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Anyone can view active jobs" ON public.jobs
    FOR SELECT
    USING (status = 'Active');

-- Add updated_at trigger
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
