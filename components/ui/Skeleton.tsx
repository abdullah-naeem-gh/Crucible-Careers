export function Skeleton({ className = '' }: { className?: string }) {
  // Uses the "slate" color family (not "gray"/"white") because globals.css's
  // theme-override system does substring matching on the raw class attribute
  // (e.g. `[class*="bg-white/"]`) with `!important` — "bg-gray-*"/"bg-white/*"
  // tokens get silently clobbered in both light and dark mode.
  return <div className={`animate-pulse rounded-md bg-slate-300/60 dark:bg-slate-300/25 ${className}`} />
}
