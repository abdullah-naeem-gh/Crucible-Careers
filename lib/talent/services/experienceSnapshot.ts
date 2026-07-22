export interface ExperienceSnapshot {
  role: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export function snapshotOf(e: { role: string; location: string; startDate: string; endDate: string; current: boolean; description: string }): ExperienceSnapshot {
  return {
    role: e.role || '',
    location: e.location || '',
    startDate: e.startDate || '',
    endDate: e.endDate || '',
    current: !!e.current,
    description: e.description || '',
  }
}

// Field-by-field comparison rather than JSON.stringify — jsonb round-trips
// through Postgres don't preserve object key order, so a string comparison
// could spuriously report "changed" even when every value is identical.
export function snapshotsEqual(a: ExperienceSnapshot, b: ExperienceSnapshot): boolean {
  return (
    a.role === b.role &&
    a.location === b.location &&
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.current === b.current &&
    a.description === b.description
  )
}
