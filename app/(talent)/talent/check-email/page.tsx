import { Suspense } from 'react'
import CheckEmailPage from '@/components/auth/CheckEmailPage'

export default function TalentCheckEmail() {
  return (
    <Suspense>
      <CheckEmailPage userType="talent" />
    </Suspense>
  )
}
