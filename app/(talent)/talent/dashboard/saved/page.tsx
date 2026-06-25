import { redirect } from 'next/navigation'

export default function SavedPage() {
  redirect('/talent/dashboard?tab=saved')
}
