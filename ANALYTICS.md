# Employer Analytics

This document describes the employer analytics system used by the Crucible Careers employer dashboard. It covers the current local/demo implementation, the backend-ready data contract, metric definitions, API direction, and implementation notes for moving analytics from browser state to persistent data.

## Current Implementation

The employer analytics workspace is rendered inside the employer dashboard tab at:

- UI: `components/employer/dashboard/AnalyticsTab.tsx`
- Analytics builder: `lib/employer/analytics/buildEmployerAnalytics.ts`
- Dashboard source data: `app/(employer)/employer/dashboard/page.tsx`

The page currently derives analytics from browser state:

- `recruiter_jobs`: localStorage key containing employer jobs.
- `recruiter_job_${jobId}_applicants`: localStorage key containing applicant screening state for each job.

The UI is organized into four top-level views:

- `Overview`: portfolio KPIs, funnel movement, timeline, recruiter queue, and role watchlist.
- `Roles`: role comparison, conversion diagnostics, review backlog, low-coverage requirements, and role-specific recommendations.
- `Candidates`: quality buckets, review queue, top candidates, experience mix, and decision rates by role.
- `Sources`: source attribution when backend events exist, plus current fallback views for job type and location performance.

## Snapshot Contract

The canonical response shape is `EmployerAnalyticsSnapshot` from `buildEmployerAnalytics.ts`. The UI should consume this shape whether analytics are built locally or returned by an API.

Important top-level sections:

```ts
interface EmployerAnalyticsSnapshot {
  summary: EmployerAnalyticsSummary;
  funnel: EmployerAnalyticsFunnelStep[];
  jobs: EmployerAnalyticsJobRow[];
  roleInsights: EmployerRoleInsight[];
  candidateInsights: EmployerCandidateInsights;
  candidateQuality: EmployerCandidateQuality;
  sourceInsights: EmployerSourceInsights;
  timeline: EmployerTimelinePoint[];
  insights: EmployerAnalyticsInsight[];
}
```

Percent values are stored as percentage numbers, not decimals. For example, `18` means `18%`.

### Core Inputs

```ts
interface EmployerAnalyticsJobInput {
  id: string;
  title: string;
  location: string;
  type: string;
  status: "Active" | "Draft" | "Paused" | "Closed";
  tags: string[];
  applications: number;
  views: number;
  matchScore: number;
}

interface EmployerAnalyticsApplicantInput {
  id: string;
  name?: string;
  title?: string;
  location?: string;
  appliedDate?: string;
  screeningStatus?: "unscreened" | "shortlisted" | "rejected";
  skills?: string[];
  experienceYears?: number;
  matchScore?: number;
  source?: string;
}

type EmployerApplicantGroups = Record<string, EmployerAnalyticsApplicantInput[]>;
```

## Metric Definitions

Use `safeRate(part, whole)` for all percentages:

```ts
whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0
```

Core formulas:

- `totalJobs`: count of all employer jobs in scope.
- `activeJobs`: jobs where `status === "Active"`.
- `totalApplications`: sum of `job.applications`.
- `totalViews`: sum of `job.views`.
- `avgApplications`: rounded `totalApplications / totalJobs`.
- `avgViews`: rounded `totalViews / totalJobs`.
- `avgMatchScore`: rounded average of `job.matchScore`.
- `viewToApplyRate`: `totalApplications / totalViews`.
- `reviewed`: shortlisted applicants plus rejected applicants.
- `unreviewed`: total applicants minus reviewed applicants.
- `shortlistRate`: `totalShortlisted / totalApplications`.
- `rejectionRate`: `totalRejected / totalReviewed`.
- `job.conversionRate`: `job.applications / job.views`.

Funnel steps:

1. `views`
2. `applications`
3. `reviewed`
4. `shortlisted`
5. `rejected`

The first funnel step has no prior step, so `conversionFromPrevious` and `dropOffFromPrevious` are `null`.

## Role Insights

Each role insight includes conversion, backlog, health, skill coverage, and a recommended action.

Health rules:

- `inactive`: job status is not `Active`.
- `attention`: active job with views but no applications, at least 5 unreviewed applicants, or conversion below `max(portfolioAverageConversion * 0.65, 8)`.
- `strong`: active job with `matchScore >= 85` and conversion at or above portfolio average.
- `steady`: active job that does not match the other categories.

Role-specific fields:

- `strongSkills`: most common applicant skills for the role.
- `weakRequirements`: job tags with the lowest applicant skill coverage.
- `recommendation`: operational follow-up copy used in role tables/cards.

## Candidate Insights

Candidate analytics are derived from applicant groups. Current demo data does not provide applicant-level match scores, so `candidate.qualityScore` falls back to the role `matchScore` unless `applicant.matchScore` exists.

Candidate sections:

- `qualityBuckets`: high, medium, low quality applicant counts and percentages.
- `experienceMix`: 0-2 years, 3-5 years, and 6+ years.
- `reviewQueue`: unreviewed candidates sorted by quality and experience.
- `topCandidates`: highest-quality candidates that have not been rejected.
- `roleDecisionRates`: shortlist, rejection, and unreviewed rates by role.

When backend candidate scoring exists, prefer applicant-level match scores over role-level fallback scores.

## Source Insights

Current local data does not track real source attribution. The `Sources` tab therefore supports two modes:

- `hasSourceData = true`: render actual source/channel rows from applicant or event source fields.
- `hasSourceData = false`: show a clear attribution fallback and use job type/location performance as temporary sourcing proxies.

Recommended backend source values:

- `LinkedIn`
- `Referral`
- `Company site`
- `Job board`
- `Direct`
- `Campaign`
- `Other`

Source rows should include views, applications, conversion, shortlisted, rejected, quality score, and recommendation.

## Timeline

`timeline` is currently a demo-mode weekly distribution generated from aggregate job/application counts. It exists so the UI can be built now and later replaced by event-backed data.

Production timeline should be derived from dated events:

- job views by day/week,
- applications by day/week,
- reviewed applicants by day/week,
- shortlisted applicants by day/week,
- rejected applicants by day/week.

## Proposed Backend API

Add an employer analytics endpoint under the existing App Router API structure:

```txt
GET /api/employer/analytics?range=30d&view=all
```

Supported query parameters:

- `range`: `7d`, `30d`, `90d`, or `all`. Default: `30d`.
- `view`: `overview`, `roles`, `candidates`, `sources`, or `all`. Default: `all`.
- `jobId`: optional job filter for a single-role analytics view.

Response:

```ts
type GetEmployerAnalyticsResponse = EmployerAnalyticsSnapshot;
```

Example handler location:

```txt
app/api/employer/analytics/route.ts
```

Handler responsibilities:

1. Authenticate employer and resolve `employerId`.
2. Load jobs owned by that employer.
3. Load view/application/review events in the requested range.
4. Load applicant screening state and candidate scoring per job.
5. Load source attribution for view and application events.
6. Build or query `EmployerAnalyticsSnapshot`.
7. Return JSON.

Errors:

- `401`: unauthenticated.
- `403`: authenticated user is not an employer or cannot access requested job.
- `400`: invalid `range`, `view`, or malformed query.
- `500`: unexpected analytics aggregation failure.

## Event Model For Real Analytics

Recommended event records:

```txt
job_view_events
- id
- job_id
- employer_id
- viewer_id nullable
- source nullable
- created_at

application_events
- id
- job_id
- employer_id
- applicant_id
- source nullable
- created_at

applicant_screening_events
- id
- job_id
- employer_id
- applicant_id
- from_status nullable
- to_status: unscreened | shortlisted | rejected
- created_at

applicant_score_snapshots
- applicant_id
- job_id
- match_score
- skills text[]
- experience_years
- updated_at
```

If full event tables are not available, the backend can temporarily compute from jobs and applications tables, but time ranges and source attribution will be incomplete.

## Frontend Integration Notes

Current flow:

1. `AnalyticsTab` receives `jobs` from the dashboard page.
2. It loads applicant groups from localStorage.
3. It calls `buildEmployerAnalytics(jobs, applicantGroups)`.
4. It renders tab-specific sections from the snapshot.

Backend flow:

1. Replace the local builder call with a fetch to `/api/employer/analytics?range=${timeRange}&view=all`.
2. Keep the local builder as demo/fallback mode.
3. Preserve `EmployerAnalyticsSnapshot` so tab components do not change.
4. Wire top tabs to client state only unless backend view-specific payloads become necessary.
5. Add loading and error states around the snapshot fetch.

Do not expose service-role Supabase keys in client components. API handlers must run server-side.

## Testing Checklist

Run after analytics changes:

```bash
npx tsc --noEmit
npm run build
git diff --check
```

Manual verification:

- `/employer/dashboard?tab=analytics` with default demo jobs.
- Each top analytics tab switches without page reload.
- No jobs in `recruiter_jobs`.
- Active job with views and zero applications.
- Active job with zero views and zero applications.
- Applicant localStorage with shortlisted, rejected, and unscreened candidates.
- Sources tab with no source attribution shows the fallback state.
- Desktop layout: no clipped cards; scrollable sections work.
- Mobile layout: tabs, cards, tables, and long text do not overflow.

## Known Limitations

- Time ranges are UI state until event-backed analytics are implemented.
- Source attribution is unavailable unless applicants/events include `source`.
- Candidate quality falls back to role-level `matchScore` until applicant-level scoring exists.
- LocalStorage is demo-mode only and is not shared across users/devices.
