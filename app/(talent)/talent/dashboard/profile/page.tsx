import { redirect } from 'next/navigation'

export default function ProfilePage() {
  redirect('/talent/dashboard?tab=profile')
}
