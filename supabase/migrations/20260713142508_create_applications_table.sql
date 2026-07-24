CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    talent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Applied'
        CHECK (status IN ('Applied', 'Under Review', 'Interview', 'Offer', 'Rejected')),
    resume_url TEXT,
    resume_filename TEXT,
    cover_letter TEXT,
    custom_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    ats_score NUMERIC,
    rating INT CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),
    note TEXT CHECK (note IS NULL OR char_length(note) <= 100),
    applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    status_updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (job_id, talent_id)
);

CREATE INDEX IF NOT EXISTS applications_job_id_idx ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS applications_talent_id_idx ON public.applications(talent_id);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Grant permissions explicitly (no anon access — applications are private)
REVOKE ALL ON TABLE public.applications FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.applications TO authenticated;
GRANT ALL ON TABLE public.applications TO service_role;

-- Policies
CREATE POLICY "Talent can insert own applications" ON public.applications
    FOR INSERT
    WITH CHECK (talent_id = auth.uid());

CREATE POLICY "Talent can view own applications" ON public.applications
    FOR SELECT
    USING (talent_id = auth.uid());

CREATE POLICY "Employers can view applications to their jobs" ON public.applications
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()));

CREATE POLICY "Employers can update applications to their jobs" ON public.applications
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()));

-- updated_at bookkeeping (reuses existing shared trigger function)
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- status_updated_at bookkeeping (applications-specific)
CREATE OR REPLACE FUNCTION public.handle_application_status_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.status_updated_at = now();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER touch_application_status_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_application_status_touch();
