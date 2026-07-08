'use client'

import { motion } from 'framer-motion'
import { IconPlus } from '@tabler/icons-react'
import type { TalentEducation } from '@/types/talent/profile'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400'
const F = 'w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all'

export function newEducation(): TalentEducation {
  return {
    id: `edu-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    school: '', degree: '', field: '', startYear: '', endYear: '', description: '',
  }
}

interface Props {
  education: TalentEducation[]
  onChange: (education: TalentEducation[]) => void
}

export default function OnboardingStep6({ education, onChange }: Props) {
  const update = (id: string, patch: Partial<TalentEducation>) =>
    onChange(education.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  const remove = (id: string) =>
    onChange(education.filter((e) => e.id !== id))

  return (
    <div className="space-y-4">
      <div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add education</h2>
            <p className="mt-1 text-sm text-gray-500">Degrees, certifications, bootcamps — anything relevant.</p>
          </div>
          <button
            type="button"
            onClick={() => onChange([...education, newEducation()])}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 text-xs font-semibold text-[#FF6B00] hover:bg-orange-100 transition-all flex-shrink-0"
          >
            <IconPlus size={13} /> Add
          </button>
        </motion.div>
      </div>

      <div className="space-y-4 max-h-[44vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">
        {education.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Education {index + 1}
              </span>
              {education.length > 1 && (
                <button type="button" onClick={() => remove(item.id)}
                  className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={L}>School / Institution</label>
                <input className={F} value={item.school}
                  onChange={(e) => update(item.id, { school: e.target.value })}
                  placeholder="University of Engineering" />
              </div>
              <div>
                <label className={L}>Degree</label>
                <input className={F} value={item.degree}
                  onChange={(e) => update(item.id, { degree: e.target.value })}
                  placeholder="BS Computer Science" />
              </div>
              <div>
                <label className={L}>Field</label>
                <input className={F} value={item.field}
                  onChange={(e) => update(item.id, { field: e.target.value })}
                  placeholder="Software Engineering" />
              </div>
              <div>
                <label className={L}>From</label>
                <input className={F} value={item.startYear}
                  onChange={(e) => update(item.id, { startYear: e.target.value })}
                  placeholder="2020" />
              </div>
              <div>
                <label className={L}>To</label>
                <input className={F} value={item.endYear}
                  onChange={(e) => update(item.id, { endYear: e.target.value })}
                  placeholder="2024" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
