import { redirect } from 'next/navigation'

export default function TalentJobs() {
  redirect('/talent/dashboard?tab=jobs')
}
