import { redirect } from 'next/navigation'

export default function ExamsPage() {
  redirect('/talent/dashboard?tab=exams')
}
