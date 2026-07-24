CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (job_id, talent_id)
);

CREATE INDEX IF NOT EXISTS saved_jobs_talent_id_idx ON public.saved_jobs(talent_id);
CREATE INDEX IF NOT EXISTS saved_jobs_job_id_idx ON public.saved_jobs(job_id);

-- Enable RLS
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly (no anon access — saved jobs are private)
REVOKE ALL ON TABLE public.saved_jobs FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.saved_jobs TO authenticated;
GRANT ALL ON TABLE public.saved_jobs TO service_role;

-- Policies
CREATE POLICY "Talent can view own saved jobs" ON public.saved_jobs
    FOR SELECT
    USING (talent_id = auth.uid());

CREATE POLICY "Talent can save jobs" ON public.saved_jobs
    FOR INSERT
    WITH CHECK (talent_id = auth.uid());

CREATE POLICY "Talent can unsave own jobs" ON public.saved_jobs
    FOR DELETE
    USING (talent_id = auth.uid());
