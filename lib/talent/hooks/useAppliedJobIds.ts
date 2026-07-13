import { useEffect, useState } from 'react'

export function useAppliedJobIds() {
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/talent/applications')
      .then(res => res.ok ? res.json() : [])
      .then((list: any[]) => {
        setAppliedJobIds(new Set(list.map(a => a.jobId).filter(Boolean)))
      })
      .catch(err => console.error('Failed to load applied job ids', err))
      .finally(() => setLoading(false))
  }, [])

  return { appliedJobIds, loading }
}
