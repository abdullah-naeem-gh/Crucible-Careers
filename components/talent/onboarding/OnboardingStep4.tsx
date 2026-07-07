'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Next.js',
  'PostgreSQL', 'AWS', 'Docker', 'GraphQL', 'Tailwind CSS',
  'Vue.js', 'Go', 'Rust', 'Java', 'Figma',
  'Machine Learning', 'Data Analysis', 'CI/CD', 'Kubernetes', 'MongoDB',
]

export interface Step4Data {
  skills: string[]
}

interface Props {
  data: Step4Data
  onChange: (data: Step4Data) => void
}

export default function OnboardingStep4({ data, onChange }: Props) {
  const [input, setInput] = useState('')

  const addSkill = (skill: string) => {
    const t = skill.trim()
    if (!t || data.skills.includes(t) || data.skills.length >= 15) return
    onChange({ skills: [...data.skills, t] })
    setInput('')
  }

  const removeSkill = (skill: string) =>
    onChange({ skills: data.skills.filter((s) => s !== skill) })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input) }
    if (e.key === 'Backspace' && input === '' && data.skills.length > 0)
      removeSkill(data.skills[data.skills.length - 1])
  }

  const visible = SKILL_SUGGESTIONS.filter((s) => !data.skills.includes(s)).slice(0, 10)

  return (
    <div className="space-y-5">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900">Add searchable skills</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="mt-1 text-sm text-gray-500">
          These become chips on your profile and power job matching.
        </motion.p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Skills <span className="normal-case tracking-normal font-normal">(up to 15)</span>
          </span>
          <span className="text-[10px] text-gray-400 tabular-nums">{data.skills.length}/15</span>
        </div>

        {/* Tag input */}
        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2.5 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all min-h-[52px]">
          {data.skills.map((skill) => (
            <span key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-gray-900 transition-colors">×</button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(input)}
            placeholder={data.skills.length === 0 ? 'Type a skill and press Enter…' : ''}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
            disabled={data.skills.length >= 15}
          />
        </div>

        {/* Suggestions */}
        {visible.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {visible.map((s) => (
              <button key={s} type="button" onClick={() => addSkill(s)}
                className="px-2.5 py-1 rounded-full border border-gray-200 text-[11px] text-gray-600 hover:border-orange-300 hover:text-[#FF6B00] hover:bg-orange-50 transition-all">
                + {s}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {data.skills.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-gray-400"
        >
          ✓ {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''} added
        </motion.p>
      )}
    </div>
  )
}
