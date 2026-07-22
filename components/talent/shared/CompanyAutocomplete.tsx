'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchCompanyNames, type CompanySuggestion } from '@/lib/talent/services/companies.service'

const MAX_SUGGESTIONS = 8

export interface CompanyAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputClassName: string
}

export default function CompanyAutocomplete({ value, onChange, placeholder, inputClassName }: CompanyAutocompleteProps) {
  const [companies, setCompanies] = useState<CompanySuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    fetchCompanyNames().then(setCompanies).catch((err) => console.error('Error loading company names:', err))
  }, [])

  const suggestions = value.trim()
    ? companies.filter((c) => c.name.toLowerCase().includes(value.trim().toLowerCase())).slice(0, MAX_SUGGESTIONS)
    : []

  const positionDropdown = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect()
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width })
    }
  }

  const openDropdown = () => {
    positionDropdown()
    setOpen(true)
  }

  const closeDropdown = () => setOpen(false)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!inputRef.current?.contains(target) && !listRef.current?.contains(target)) closeDropdown()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', positionDropdown, true)
    window.addEventListener('resize', positionDropdown)
    return () => {
      window.removeEventListener('scroll', positionDropdown, true)
      window.removeEventListener('resize', positionDropdown)
    }
  }, [open])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        className={inputClassName}
        onChange={(e) => {
          const next = e.target.value
          onChange(next)
          if (next.trim()) {
            positionDropdown()
            setOpen(true)
          } else {
            closeDropdown()
          }
        }}
        onFocus={() => {
          if (value.trim() && suggestions.length > 0) openDropdown()
        }}
      />

      {mounted && createPortal(
        <AnimatePresence>
          {open && coords && suggestions.length > 0 && (
            <div
              ref={listRef}
              style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 99999 }}
            >
              <motion.div
                initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.94 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ transformOrigin: 'top' }}
                className="rounded-xl border border-gray-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden dark:border-white/[0.09] dark:bg-[#1c1c1c] dark:shadow-[0_16px_48px_rgba(0,0,0,0.75)]"
              >
                <div className="max-h-52 overflow-y-auto py-1">
                  {suggestions.map((company) => (
                    <button
                      key={company.name}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        onChange(company.name)
                        closeDropdown()
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 text-[10px] font-bold text-[#FF6B00] dark:border-white/[0.08] dark:from-white/[0.06] dark:to-white/[0.02]">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                        ) : (
                          company.name.charAt(0).toUpperCase()
                        )}
                      </span>
                      <span className="truncate">{company.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}
