-- Drop the old constraint first so the data migration below can write
-- the new lowercase pipeline-stage vocabulary.
ALTER TABLE public.applications DROP CONSTRAINT applications_status_check;

UPDATE public.applications SET status = CASE status
  WHEN 'Applied' THEN 'applied'
  WHEN 'Under Review' THEN 'shortlisted'
  WHEN 'Interview' THEN 'interviewing'
  WHEN 'Offer' THEN 'offered'
  WHEN 'Rejected' THEN 'rejected'
  ELSE status
END;

ALTER TABLE public.applications ADD CONSTRAINT applications_status_check
  CHECK (status IN ('applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'feedback', 'rejected'));

ALTER TABLE public.applications ALTER COLUMN status SET DEFAULT 'applied';
