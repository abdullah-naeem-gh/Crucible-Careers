'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { IconPlus, IconCheck, IconLoader2, IconFileText } from '@tabler/icons-react'
import type { TalentExperience } from '@/types/talent/profile'
import MonthYearPicker from '@/components/talent/profile/MonthYearPicker'

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
    payslipVerified: false,
  }
}

interface Props {
  experience: TalentExperience[]
  onChange: (experience: TalentExperience[]) => void
}

export default function OnboardingStep5({ experience, onChange }: Props) {
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const update = (id: string, patch: Partial<TalentExperience>) =>
    onChange(experience.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const remove = (id: string) =>
    onChange(experience.filter((e) => e.id !== id))

  const handleVerify = (id: string) => {
    setVerifyingId(id)
    setTimeout(() => {
      update(id, { payslipVerified: true })
      setVerifyingId(null)
    }, 1200)
  }

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
            className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Experience {index + 1}
              </span>
              {experience.length > 1 && (
                <button type="button" onClick={() => remove(item.id)}
                  className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors">
                  Remove
                </button>
              )}
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
                <input className={F} value={item.company}
                  onChange={(e) => update(item.id, { company: e.target.value })}
                  placeholder="TechCorp" />
              </div>
              <div className="col-span-2">
                <label className={L}>Start</label>
                <MonthYearPicker
                  value={item.startDate}
                  onChange={(startDate) => update(item.id, { startDate })}
                  ariaLabel="Work experience start date"
                />
              </div>
              <div className="col-span-2">
                <label className={L}>End</label>
                {item.current ? (
                  <div className={`${F} cursor-not-allowed text-gray-500 opacity-70`}>Present</div>
                ) : (
                  <MonthYearPicker
                    value={item.endDate}
                    onChange={(endDate) => update(item.id, { endDate })}
                    ariaLabel="Work experience end date"
                  />
                )}
              </div>
              <label className="col-span-2 inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={item.current}
                  onChange={(e) => update(item.id, { current: e.target.checked, endDate: e.target.checked ? '' : item.endDate })}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#FF6B00] focus:ring-orange-500 cursor-pointer" />
                Currently working here
              </label>

              {/* Salary Verification Section */}
              <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 pt-3 mt-1">
                <div>
                  <label className={L}>How much did you make previously?</label>
                  <input className={F} value={item.previousSalary || ''}
                    onChange={(e) => update(item.id, { previousSalary: e.target.value })}
                    placeholder="e.g. $80,000 / yr or PKR 150k / mo" />
                </div>
                <div className="flex flex-col justify-end">
                  <label className={L}>Verification status</label>
                  {item.payslipVerified ? (
                    <div className="flex items-center gap-2 h-[46px] px-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-semibold">
                      <IconCheck size={18} className="text-emerald-600" />
                      <span>Verified with payslips</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={verifyingId === item.id}
                      onClick={() => handleVerify(item.id)}
                      className="flex items-center justify-center gap-2 h-[46px] w-full rounded-xl border border-dashed border-orange-300 bg-orange-50/30 text-[#FF6B00] hover:bg-orange-50 hover:border-orange-400 text-xs font-semibold transition-all disabled:opacity-75"
                    >
                      {verifyingId === item.id ? (
                        <>
                          <IconLoader2 size={16} className="animate-spin" />
                          <span>Uploading & verifying...</span>
                        </>
                      ) : (
                        <>
                          <IconFileText size={16} />
                          <span>Verify with payslips</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
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

