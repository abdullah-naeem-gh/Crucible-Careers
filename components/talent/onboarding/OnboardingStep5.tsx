'use client'

import { motion } from 'framer-motion'
import { IconPlus } from '@tabler/icons-react'
import type { TalentExperience } from '@/types/talent/profile'
import CompanyAutocomplete from '@/components/talent/shared/CompanyAutocomplete'
import ExperienceVerificationBadge from '@/components/talent/shared/ExperienceVerificationBadge'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400'
const F = 'w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all'

export function newExperience(): TalentExperience {
  return {
    id: crypto.randomUUID(),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    previousSalary: '',
  }
}

interface Props {
  experience: TalentExperience[]
  onChange: (experience: TalentExperience[]) => void
}

export default function OnboardingStep5({ experience, onChange }: Props) {
  const update = (id: string, patch: Partial<TalentExperience>) =>
    onChange(experience.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const remove = (id: string) =>
    onChange(experience.filter((e) => e.id !== id))

  return (
    <div className="space-y-4">
      <div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add work experience</h2>
            <p className="mt-1 text-sm text-gray-500">Describe your impact, not just your duties.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange([...experience, { ...newExperience(), id: crypto.randomUUID() }])}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 transition-all flex-shrink-0"
          >
            <IconPlus size={13} /> Add
          </button>
        </motion.div>
      </div>

      <div className="space-y-4 max-h-[44vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">
        {experience.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`rounded-xl border p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)] ${
              item.verificationStatus === 'rejected' ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Experience {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <ExperienceVerificationBadge
                  status={item.verificationStatus}
                  company={item.company}
                  verificationRequestId={item.verificationRequestId}
                  rejectionReason={item.verificationRejectionReason}
                  requestedAt={item.verificationRequestedAt}
                  canResendAfterEdit={item.verificationCanResend}
                />
                {experience.length > 1 && (
                  <button type="button" onClick={() => remove(item.id)}
                    className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={L}>Role</label>
                <input className={F} value={item.role}
                  onChange={(e) => update(item.id, { role: e.target.value })}
                  placeholder="Frontend Engineer" />
              </div>
              <div>
                <label className={L}>Company</label>
                <CompanyAutocomplete value={item.company}
                  onChange={(v) => update(item.id, { company: v })}
                  placeholder="TechCorp" inputClassName={F} />
              </div>
              <div>
                <label className={L}>Start</label>
                <input className={F} value={item.startDate}
                  onChange={(e) => update(item.id, { startDate: e.target.value })}
                  placeholder="2022" />
              </div>
              <div>
                <label className={L}>End</label>
                <input className={F} value={item.current ? 'Present' : item.endDate}
                  disabled={item.current}
                  onChange={(e) => update(item.id, { endDate: e.target.value })}
                  placeholder="2024" />
              </div>
              <label className="col-span-2 inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={item.current}
                  onChange={(e) => update(item.id, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#FF6B00] focus:ring-orange-500 cursor-pointer" />
                Currently working here
              </label>

              <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                <label className={L}>How much did you make previously?</label>
                <input className={F} value={item.previousSalary || ''}
                  onChange={(e) => update(item.id, { previousSalary: e.target.value })}
                  placeholder="e.g. $80,000 / yr or PKR 150k / mo" />
              </div>

              <div className="col-span-2">
                <label className={L}>Impact</label>
                <textarea className={F} rows={2} value={item.description}
                  onChange={(e) => update(item.id, { description: e.target.value })}
                  placeholder="Describe outcomes, ownership, and measurable impact." />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

