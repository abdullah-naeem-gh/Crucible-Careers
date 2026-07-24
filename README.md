# An in-house product of Salik Labs

## What is Crucible Careers?

Crucible Careers is a two-sided recruitment platform that merges three things teams usually stitch together with separate tools: a **job board**, a **profile-building platform**, and a full **Applicant Tracking System (ATS)**.

For **job seekers**, it's a single place to build one rich, verifiable profile, pulling in GitHub activity, LinkedIn data, and resume content, instead of re-typing the same information into every application form. That profile can grow over time through badges (e.g., a **Certified AI Engineer** badge earned via a proctored exam), and it gives seekers visibility into how they stack up against other applicants for a role, not just whether they were rejected.

For **recruiters**, Crucible replaces two separate habits companies currently rely on:

1. Using Google Forms or spreadsheets to collect applications.
2. Using a paid ATS like Greenhouse or Lever to manage the hiring pipeline.

In Crucible, a recruiter builds a custom application form, gets a public shareable link (no login wall to view/share, Google login only to apply), and from there manages the entire pipeline—scoring, filtering, shortlisting, emailing, and even querying an AI chatbot about specific candidates—inside one dashboard.

**In short:** Crucible is positioned as a unified hiring layer—a Google Forms replacement, a LinkedIn-style profile layer, and an enterprise ATS combined into one in-house product.

---

# 1. Job Seeker Role

## Core Features

### Profile Building

- Build a single profile that fully represents the user.
- Connect and import data from **GitHub**.
- Pull information directly from **LinkedIn**.
- Upload or paste a **resume** into the profile.
- Manually add **projects** and **work experience**.
- Earn profile **badges** (e.g., *Certified AI Engineer*) after passing proctored exams.

### Job Discovery

- Explore jobs using filters such as:
  - Location
  - Company
  - Role
  - And more
- Explore **company profiles** and browse all open positions from a company in one place.

### Application Intelligence

- See where they stand among other applicants for a role.
- Use an **AI chatbot** to discover relevant jobs based on their experience and qualifications.

---

# 2. Recruiter Role

## Core Features

### Company Presence

- Build a public **company profile page** containing:
  - Company overview
  - Culture
  - Key information

### Job Management

- Create and publish job postings.
- Build a **custom job application form**.
- Generate a **public, shareable Crucible link** that anyone can access without a Crucible account.
- Require applicants to **sign in with Google** before submitting an application.

### Applicant Tracking & Evaluation

- Access a recruiter dashboard with applicant metrics.
- View quick-shortlisting insights per applicant, including:
  - GitHub and related platforms (Dribbble, Behance, Google Drive, etc.) to assess contribution activity.
  - Consistency score between LinkedIn, resume, and submitted profile.
  - ATS score showing how well the resume matches the Job Description (JD).

### Candidate Management

- Filter applicants to shortlist candidates faster.
- Send automated emails to shortlisted or rejected candidates.
- Customize email templates and communication formats.

### AI-Powered Recruiting

- Use an AI chatbot to ask natural-language questions about applicants.
- Talent profiles, company profiles, and job postings are embedded with an open-source model and stored in a **Qdrant vector database**, powering real cosine-similarity match scores (talent ↔ job, and candidate ↔ job on the employer side) and sharper AI job recommendations.
