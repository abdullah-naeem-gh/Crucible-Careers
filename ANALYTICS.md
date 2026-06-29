# Employer Analytics

This document describes the employer analytics system used by the Crucible Careers employer dashboard. It covers the current local/demo implementation, the backend-ready data contract, metric definitions, proposed API endpoints, and implementation notes for moving analytics from browser state to persistent data.

## Current Implementation

The employer analytics page is rendered inside the employer dashboard tab at:

- UI: `components/employer/dashboard/AnalyticsTab.tsx`
- Analytics builder: `lib/employer/analytics/buildEmployerAnalytics.ts`
- Dashboard source data: `app/(employer)/employer/dashboard/page.tsx`

The dashboard currently derives analytics from two client-side sources:

- `recruiter_jobs`: localStorage key containing employer jobs.
- `recruiter_job_${jobId}_applicants`: localStorage key containing applicant screening state for each job.

The UI intentionally uses one derived analytics snapshot shape so the current local implementation can later be replaced by `GET /api/employer/analytics` without redesigning the page.

## Analytics Snapshot Contract

The canonical response shape is `EmployerAnalyticsSnapshot` from `buildEmployerAnalytics.ts`.

```ts
interface EmployerAnalyticsSnapshot {
  summary: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalViews: number;
    totalShortlisted: number;
    totalRejected: number;
    totalReviewed: number;
    totalUnreviewed: number;
    avgApplications: number;
    avgViews: number;
    avgMatchScore: number;
    viewToApplyRate: number;
    shortlistRate: number;
    rejectionRate: number;
  };
  funnel: Array<{
    key: "views" | "applications" | "reviewed" | "shortlisted" | "rejected";
    label: string;
    value: number;
    conversionFromPrevious: number | null;
    dropOffFromPrevious: number | null;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    status: "Active" | "Draft" | "Paused" | "Closed";
    views: number;
    applications: number;
    conversionRate: number;
    matchScore: number;
    shortlisted: number;
    rejected: number;
    unreviewed: number;
    totalApplicants: number;
    health: "strong" | "attention" | "steady" | "inactive";
    recommendation: string;
  }>;
  candidateQuality: {
    averageMatchScore: number;
    shortlistRatio: number;
    topSkills: Array<{ skill: string; count: number }>;
    weakTags: Array<{ skill: string; count: number }>;
  };
  insights: Array<{
    id: string;
    title: string;
    body: string;
    tone: "positive" | "warning" | "neutral";
    jobId?: string;
  }>;
}
```

Percent values are stored as percentage numbers, not decimals. For example, `18` means `18%`.

## Input Data Requirements

The analytics builder currently accepts:

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
  screeningStatus?: "unscreened" | "shortlisted" | "rejected";
  skills?: string[];
  experienceYears?: number;
}

type EmployerApplicantGroups = Record<string, EmployerAnalyticsApplicantInput[]>;
```

Backend data should provide equivalent fields. Avoid duplicating metric formulas in the UI; keep formulas in a server/helper layer and return the snapshot contract.

## Metric Definitions

Use `safeRate(part, whole)` for all percentages:

```ts
whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0
```

This produces one decimal place and prevents `NaN` or `Infinity`.

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

Each funnel step includes conversion from the previous step and drop-off from the previous step. The first step has `null` conversion/drop-off because there is no prior step.

## Job Health Rules

Each job receives a health status for prioritization.

- `inactive`: job status is not `Active`.
- `attention`: active job with one of these conditions:
  - has views but zero applications,
  - has at least 5 unreviewed applicants,
  - conversion is lower than `max(portfolioAverageConversion * 0.65, 8)`.
- `strong`: active job with `matchScore >= 85` and conversion at or above portfolio average.
- `steady`: active job that does not match the other categories.

Recommendations should be concrete and operational. Avoid AI-styled language such as “unlock insights” or “smart recommendations.” Preferred wording should describe what the recruiter should review or do next.

## Candidate Quality Metrics

Candidate quality is derived from applicant skills and job tags.

- `topSkills`: top six skills found across applicants, sorted by count descending and name ascending.
- `weakTags`: top six job tags with the lowest matching applicant skill counts.
- `averageMatchScore`: average job `matchScore`.
- `shortlistRatio`: shortlisted applicants divided by total applications.

Current limitation: `matchScore` is job-level demo data, not applicant-level scoring. When backend applicant scoring exists, candidate quality should prefer applicant-level match scores.

## Proposed Backend API

Add an employer analytics endpoint under the existing App Router API structure:

```txt
GET /api/employer/analytics?range=30d
```

Supported query parameters:

- `range`: `7d`, `30d`, `90d`, or `all`. Default: `30d`.
- `jobId`: optional job filter for a single-job analytics view.

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
3. Load view/application/review events in the requested date range.
4. Load applicant screening state per job.
5. Build or query the analytics snapshot.
6. Return `EmployerAnalyticsSnapshot` as JSON.

Errors:

- `401`: unauthenticated.
- `403`: authenticated user is not an employer or cannot access requested job.
- `400`: invalid `range` or malformed query.
- `500`: unexpected analytics aggregation failure.

## Event Model for Real Analytics

The current code stores aggregate `views` and `applications` on each job. A real backend should collect events so time ranges are accurate.

Recommended tables or equivalent records:

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
- created_at

applicant_screening_events
- id
- job_id
- employer_id
- applicant_id
- from_status nullable
- to_status: unscreened | shortlisted | rejected
- created_at

applicant_skill_snapshots
- applicant_id
- skills text[]
- updated_at
```

If full event tables are not immediately available, a transitional backend can compute from existing jobs and applications tables, but time range controls will only be approximate until events exist.

## Frontend Integration Plan

Current frontend flow:

1. `AnalyticsTab` receives `jobs` from the dashboard page.
2. It loads applicant groups from localStorage.
3. It calls `buildEmployerAnalytics(jobs, applicantGroups)`.
4. It renders the snapshot.

Backend flow:

1. Replace local `buildEmployerAnalytics(...)` call in `AnalyticsTab` with a client fetch or server-provided prop.
2. Keep `EmployerAnalyticsSnapshot` unchanged.
3. Preserve the local builder as a fallback/demo adapter if the API is unavailable.
4. Wire time-range buttons to refetch `/api/employer/analytics?range=${timeRange}`.
5. Show loading and error states in the analytics tab.

Do not expose service-role Supabase keys in client components. API handlers must run server-side and use the correct server credentials.

## UI Sections

The current analytics dashboard shows:

- KPI cards: views, applications, view-to-apply rate, shortlisted count, active roles, average match.
- Funnel movement: views to applications to reviewed to shortlisted/rejected.
- Job performance table: per-role views, applications, conversion, shortlist count, health/status, and recommendation.
- Recruiter queue: operational follow-up notes.
- Applicant mix: average match, shortlist ratio, common skills, low-coverage requirements.
- Role watchlist: compact list of open roles and conversion/review status.

The right rail is independently scrollable to avoid clipped cards on desktop layouts.

## Implementation Guidelines

- Keep metric derivation in `lib/employer/analytics/` or server API code, not in JSX.
- Keep UI copy operational and recruiter-focused.
- Use the existing dashboard visual language: dark surfaces, compact cards, uppercase metadata labels, Tabler icons, and responsive grids.
- Do not add a charting dependency unless the dashboard needs richer historical trend charts. Current bars and cards are CSS-based.
- Ensure zero-data states are explicit and never show invalid percentages.
- Treat localStorage analytics as demo-mode only.

## Testing Checklist

Run these commands after analytics changes:

```bash
npx tsc --noEmit
npm run build
git diff --check
```

Manual verification:

- `/employer/dashboard?tab=analytics` with default demo jobs.
- No jobs in `recruiter_jobs`.
- Active job with views and zero applications.
- Active job with zero views and zero applications.
- Applicant localStorage with shortlisted, rejected, and unscreened candidates.
- Desktop layout: confirm the right rail scrolls and no bottom card is clipped.
- Mobile layout: confirm all cards stack, table scrolls horizontally, and text does not overflow.

## Known Limitations

- Time ranges are UI state only until event-backed analytics are implemented.
- Job views and applications are currently aggregate fields, not dated events.
- Applicant quality is based on available applicant skills and job-level `matchScore`.
- LocalStorage is not shared across devices or users and should not be treated as production analytics storage.
