'use client'

import { useState } from 'react'
import { IconX, IconPlus } from '@tabler/icons-react'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40'

export interface Step5Data {
  benefits: string[]
  techStack: string[]
}

interface TagInputProps {
  label: string
  tags: string[]
  placeholder: string
  accentColor: string
  onChange: (tags: string[]) => void
}

function TagInput({ label, tags, placeholder, accentColor, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag))

  return (
    <div>
      <label className={L}>{label}</label>
      <div className="flex gap-2 mb-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
          }}
          className="flex-1 rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/10 transition-colors"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/55 hover:bg-white/[0.08] hover:text-white transition-colors"
        >
          <IconPlus size={13} />
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}25`,
                color: accentColor,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <IconX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  data: Step5Data
  onChange: (d: Step5Data) => void
}

export default function EmployerStep5({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Perks & tech stack</h2>
        <p className="mt-1 text-sm text-white/40">Show candidates what makes working here great.</p>
      </div>

      <div className="space-y-5">
        <TagInput
          label="Perks & benefits"
          tags={data.benefits}
          placeholder="e.g. Health insurance, Remote work…"
          accentColor="#34d399"
          onChange={(benefits) => onChange({ ...data, benefits })}
        />
        <TagInput
          label="Tech stack"
          tags={data.techStack}
          placeholder="e.g. React, Node.js, PostgreSQL…"
          accentColor="#FF6B00"
          onChange={(techStack) => onChange({ ...data, techStack })}
        />
      </div>

      <p className="text-[11px] text-white/25 leading-relaxed">
        Press <kbd className="rounded px-1 py-0.5 border border-white/10 bg-white/[0.04] text-[10px]">Enter</kbd> or <kbd className="rounded px-1 py-0.5 border border-white/10 bg-white/[0.04] text-[10px]">,</kbd> to add each item.
      </p>
    </div>
  )
}
