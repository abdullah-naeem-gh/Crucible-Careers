'use client'

import { useState } from 'react'
import DarkSelect from '@/components/ui/DarkSelect'

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
