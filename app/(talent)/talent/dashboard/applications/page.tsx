import { redirect } from 'next/navigation'

export default function ApplicationsPage() {
  redirect('/talent/dashboard?tab=applications')
}
