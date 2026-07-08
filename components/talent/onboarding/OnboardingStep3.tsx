'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconChevronDown, IconCheck } from '@tabler/icons-react'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400'
const F = 'w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all'

const AVAILABILITY_OPTIONS = [
  'Open to work',
  'Available immediately',
  'Available in 2 weeks',
  'Available in 1 month',
  'Not actively looking',
]
const WORK_PREFS = ['Remote', 'Hybrid', 'On-site']

const ROLE_SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Product Manager', 'UI/UX Designer',
  'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'ML Engineer',
]

export interface Step3Data {
  availability: string
  workPreference: string
  preferredRoles: string[]
  hourlyRate: string
}

interface Props {
  data: Step3Data
  onChange: (data: Step3Data) => void
}

function PillSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
            value === opt
              ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]'
              : 'border-gray-200 bg-white/70 text-gray-600 hover:border-orange-200 hover:text-[#FF6B00]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function OnboardingStep3({ data, onChange }: Props) {
  const [roleInput, setRoleInput] = useState('')

  const addRole = (role: string) => {
    const t = role.trim()
    if (!t || data.preferredRoles.includes(t) || data.preferredRoles.length >= 5) return
    onChange({ ...data, preferredRoles: [...data.preferredRoles, t] })
    setRoleInput('')
  }

  const removeRole = (role: string) =>
    onChange({ ...data, preferredRoles: data.preferredRoles.filter((r) => r !== role) })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addRole(roleInput) }
    if (e.key === 'Backspace' && roleInput === '' && data.preferredRoles.length > 0)
      removeRole(data.preferredRoles[data.preferredRoles.length - 1])
  }

  return (
    <div className="space-y-5">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900">
          Define how you want to work
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="mt-1 text-sm text-gray-500">
          These preferences help us filter the best opportunities for you.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className={L}>Availability</label>
        <PillSelect value={data.availability} options={AVAILABILITY_OPTIONS} onChange={(v) => onChange({ ...data, availability: v })} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <label className={L}>Work preference</label>
        <PillSelect value={data.workPreference} options={WORK_PREFS} onChange={(v) => onChange({ ...data, workPreference: v })} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <label className={L}>Preferred roles <span className="normal-case tracking-normal font-normal text-gray-400">(up to 5)</span></label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all min-h-[46px]">
          {data.preferredRoles.map((role) => (
            <span key={role} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-[#FF6B00]">
              {role}
              <button type="button" onClick={() => removeRole(role)} className="hover:text-orange-800">×</button>
            </span>
          ))}
          <input
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addRole(roleInput)}
            placeholder={data.preferredRoles.length === 0 ? 'Type a role and press Enter…' : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
            disabled={data.preferredRoles.length >= 5}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {ROLE_SUGGESTIONS.filter((s) => !data.preferredRoles.includes(s)).slice(0, 5).map((s) => (
            <button key={s} type="button" onClick={() => addRole(s)}
              className="px-2.5 py-1 rounded-full border border-gray-200 text-[11px] text-gray-600 hover:border-orange-300 hover:text-[#FF6B00] hover:bg-orange-50 transition-all">
              + {s}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <label className={L}>Rate or salary preference</label>
        <input
          className={F}
          value={data.hourlyRate}
          onChange={(e) => onChange({ ...data, hourlyRate: e.target.value })}
          placeholder="USD 35/hr or PKR 250k/mo"
        />
      </motion.div>
    </div>
  )
}
