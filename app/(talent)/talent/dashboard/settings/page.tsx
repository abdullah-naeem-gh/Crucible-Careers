import { redirect } from 'next/navigation'

export default function SettingsPage() {
  redirect('/talent/dashboard?tab=settings')
}
