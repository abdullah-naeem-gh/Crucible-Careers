import { Suspense } from 'react'
import CheckEmailPage from '@/components/auth/CheckEmailPage'

export default function EmployerCheckEmail() {
  return (
    <Suspense>
      <CheckEmailPage userType="employer" />
    </Suspense>
  )
}
