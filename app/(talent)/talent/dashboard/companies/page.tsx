import { redirect } from 'next/navigation'

export default function CompaniesPage() {
  redirect('/talent/dashboard?tab=companies')
}
