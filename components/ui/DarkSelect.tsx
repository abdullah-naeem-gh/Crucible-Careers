'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'

const F = 'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/10 dark:border-white/[0.08] dark:bg-[#121212]'

export interface DarkSelectProps {
  value: string
  placeholder: string
  options: string[]
  onChange: (v: string) => void
}

export default function DarkSelect({ value, placeholder, options, onChange }: DarkSelectProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Only render portal on the client (after hydration)
  useEffect(() => setMounted(true), [])

  // Position the portal dropdown below the trigger
  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    setOpen(true)
  }

  const closeDropdown = () => setOpen(false)
  const toggle = () => (open ? closeDropdown() : openDropdown())

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) closeDropdown()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return
    const reposition = () => {
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect()
        setCoords({ top: r.bottom + 6, left: r.left, width: r.width })
      }
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        className={`${F} flex items-center justify-between text-left cursor-pointer ${
          value ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-white/20'
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 ml-2 text-gray-400 dark:text-white/30"
        >
          <IconChevronDown size={15} />
        </motion.span>
      </button>

      {/* AnimatePresence INSIDE createPortal — React can track mount/unmount correctly */}
      {mounted && createPortal(
        <AnimatePresence>
          {open && coords && (
            <div
              ref={listRef}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 99999,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -4, scaleY: 0.94 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ transformOrigin: 'top' }}
                className="rounded-xl border border-gray-200 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden dark:border-white/[0.09] dark:bg-[#1c1c1c] dark:shadow-[0_16px_48px_rgba(0,0,0,0.75)]"
              >
                <div className="max-h-52 overflow-y-auto custom-scrollbar py-1">
                  {options.map((opt) => {
                    const isSelected = opt === value
                    return (
                      <button
                        key={opt}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          onChange(opt)
                          closeDropdown()
                        }}
                        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-50 text-[#FF6B00] dark:bg-[#FF6B00]/10 dark:text-[#FF914D]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white/65 dark:hover:bg-white/[0.06] dark:hover:text-white'
                        }`}
                      >
                        {opt}
                        {isSelected && <IconCheck size={13} className="shrink-0 text-[#FF6B00]" />}
                      </button>
                    )
                  })}
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
