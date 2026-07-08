'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40'
const F = 'w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/10 transition-colors'

const INDUSTRY_OPTIONS = [
  'Software & Technology',
  'Fintech',
  'Healthcare & Biotech',
  'E-Commerce & Retail',
  'Media & Entertainment',
  'Education & EdTech',
  'Gaming',
  'Consulting & Services',
  'Manufacturing',
  'Other',
]

const SIZE_OPTIONS = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '201–500 employees',
  '501–1 000 employees',
  '1 000+ employees',
]

export interface Step2Data {
  name: string
  tagline: string
  industry: string
  companySize: string
  founded: string
  headquarters: string
}

// ─── Portal dropdown — renders to document.body so overflow:hidden never clips it ─

interface DarkSelectProps {
  value: string
  placeholder: string
  options: string[]
  onChange: (v: string) => void
}

function DarkSelect({ value, placeholder, options, onChange }: DarkSelectProps) {
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
          value ? 'text-white' : 'text-white/20'
        }`}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 ml-2 text-white/30"
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
                className="rounded-xl border border-white/[0.09] bg-[#1c1c1c] shadow-[0_16px_48px_rgba(0,0,0,0.75)] overflow-hidden"
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
                        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-sm text-left transition-colors ${
                          isSelected
                            ? 'bg-[#FF6B00]/10 text-[#FF914D]'
                            : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
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


// ─── Step component ───────────────────────────────────────────────────────────

interface Props {
  data: Step2Data
  onChange: (d: Step2Data) => void
}

export default function EmployerStep2({ data, onChange }: Props) {
  const set = <K extends keyof Step2Data>(k: K, v: Step2Data[K]) =>
    onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Company identity</h2>
        <p className="mt-1 text-sm text-white/40">Tell candidates who you are.</p>
      </div>

      <div className="space-y-3.5">


        {/* Tagline */}
        <div>
          <label className={L}>Tagline</label>
          <input
            value={data.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            className={F}
            placeholder="A short sentence that captures your mission"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Industry */}
          <div>
            <label className={L}>
              Industry <span className="text-[#FF6B00]">*</span>
            </label>
            <DarkSelect
              value={data.industry}
              placeholder="Select…"
              options={INDUSTRY_OPTIONS}
              onChange={(v) => set('industry', v)}
            />
          </div>

          {/* Company size */}
          <div>
            <label className={L}>
              Company size <span className="text-[#FF6B00]">*</span>
            </label>
            <DarkSelect
              value={data.companySize}
              placeholder="Select…"
              options={SIZE_OPTIONS}
              onChange={(v) => set('companySize', v)}
            />
          </div>

          {/* Founded */}
          <div>
            <label className={L}>Founded</label>
            <input
              value={data.founded}
              onChange={(e) => set('founded', e.target.value)}
              className={F}
              placeholder="2018"
            />
          </div>

          {/* HQ */}
          <div>
            <label className={L}>
              Headquarters <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              value={data.headquarters}
              onChange={(e) => set('headquarters', e.target.value)}
              className={F}
              placeholder="San Francisco, CA"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
