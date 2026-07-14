import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SavedJob } from '@/types/talent/job'

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    return fetch('/api/talent/saved')
      .then(res => res.ok ? res.json() : [])
      .then((data: SavedJob[]) => setSavedJobs(data))
      .catch(err => console.error('Failed to load saved jobs', err))
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const savedJobIds = useMemo(() => new Set(savedJobs.map(j => j.id)), [savedJobs])
  const isSaved = useCallback((jobId: string) => savedJobIds.has(jobId), [savedJobIds])

  const toggleSave = useCallback(async (jobId: string) => {
    const currentlySaved = savedJobIds.has(jobId)
    try {
      if (currentlySaved) {
        setSavedJobs(prev => prev.filter(j => j.id !== jobId))
        await fetch(`/api/talent/saved/${jobId}`, { method: 'DELETE' })
      } else {
        await fetch('/api/talent/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        })
        await refresh()
      }
    } catch (err) {
      console.error('Failed to toggle saved job', err)
      await refresh()
    }
  }, [savedJobIds, refresh])

  return { savedJobs, savedJobIds, isSaved, toggleSave, loading, refresh }
}
