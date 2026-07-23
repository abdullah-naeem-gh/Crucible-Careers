import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SavedJob } from '@/types/talent/job'

export function useSavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [optimisticSavedState, setOptimisticSavedState] = useState<Map<string, boolean>>(new Map())
  const [pendingJobIds, setPendingJobIds] = useState<Set<string>>(new Set())
  const pendingJobIdsRef = useRef<Set<string>>(new Set())

  const refresh = useCallback(() => {
    return fetch('/api/talent/saved')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load saved jobs (${res.status})`)
        return res.json()
      })
      .then((data: SavedJob[]) => {
        setSavedJobs(data)
        return data
      })
  }, [])

  useEffect(() => {
    refresh()
      .catch(err => console.error('Failed to load saved jobs', err))
      .finally(() => setLoading(false))
  }, [refresh])

  const savedJobIds = useMemo(() => {
    const ids = new Set(savedJobs.map(job => job.id))
    optimisticSavedState.forEach((saved, jobId) => {
      if (saved) ids.add(jobId)
      else ids.delete(jobId)
    })
    return ids
  }, [optimisticSavedState, savedJobs])
  const isSaved = useCallback((jobId: string) => savedJobIds.has(jobId), [savedJobIds])
  const isPending = useCallback((jobId: string) => pendingJobIds.has(jobId), [pendingJobIds])

  const toggleSave = useCallback(async (jobId: string) => {
    if (pendingJobIdsRef.current.has(jobId)) return

    const currentlySaved = savedJobIds.has(jobId)
    const removedSavedJob = currentlySaved ? savedJobs.find(job => job.id === jobId) : undefined
    pendingJobIdsRef.current.add(jobId)
    setPendingJobIds(prev => new Set(prev).add(jobId))
    setOptimisticSavedState(prev => new Map(prev).set(jobId, !currentlySaved))
    if (currentlySaved) setSavedJobs(prev => prev.filter(job => job.id !== jobId))

    try {
      let response: Response
      if (currentlySaved) {
        response = await fetch(`/api/talent/saved/${jobId}`, { method: 'DELETE' })
      } else {
        response = await fetch('/api/talent/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId }),
        })
      }

      if (!response.ok) throw new Error(`Failed to update saved job (${response.status})`)

      pendingJobIdsRef.current.delete(jobId)
      setPendingJobIds(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })

      void refresh()
        .then(data => {
          const serverSaved = data.some(job => job.id === jobId)
          if (serverSaved !== !currentlySaved) return
          setOptimisticSavedState(prev => {
            const next = new Map(prev)
            next.delete(jobId)
            return next
          })
        })
        .catch(err => console.error('Failed to refresh saved jobs', err))
    } catch (err) {
      console.error('Failed to toggle saved job', err)
      pendingJobIdsRef.current.delete(jobId)
      setPendingJobIds(prev => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
      setOptimisticSavedState(prev => {
        const next = new Map(prev)
        next.delete(jobId)
        return next
      })
      if (removedSavedJob) {
        setSavedJobs(prev => prev.some(job => job.id === removedSavedJob.id) ? prev : [...prev, removedSavedJob])
      }
    }
  }, [refresh, savedJobIds, savedJobs])

  return { savedJobs, savedJobIds, isSaved, isPending, toggleSave, loading, refresh }
}
