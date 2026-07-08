'use client'

import { IconBrandLinkedin, IconBrandX, IconWorld } from '@tabler/icons-react'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40'
const F = 'w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/10 transition-colors'

export interface Step3Data {
  website: string
  linkedin: string
  twitter: string
}

interface Props {
  data: Step3Data
  onChange: (d: Step3Data) => void
}

function FieldWithIcon({
  icon,
  label,
  required,
  value,
  placeholder,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  required?: boolean
  value: string
  placeholder: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className={L}>
        {label} {required && <span className="text-[#FF6B00]">*</span>}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/30">
          {icon}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${F} pl-9`}
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

export default function EmployerStep3({ data, onChange }: Props) {
  const set = <K extends keyof Step3Data>(k: K, v: Step3Data[K]) =>
    onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Online presence</h2>
        <p className="mt-1 text-sm text-white/40">Where can candidates learn more about you?</p>
      </div>

      <div className="space-y-3.5">
        <FieldWithIcon
          icon={<IconWorld size={15} />}
          label="Website"
          required
          value={data.website}
          placeholder="https://yourcompany.com"
          onChange={(v) => set('website', v)}
        />
        <FieldWithIcon
          icon={<IconBrandLinkedin size={15} />}
          label="LinkedIn URL"
          value={data.linkedin}
          placeholder="https://linkedin.com/company/…"
          onChange={(v) => set('linkedin', v)}
        />
        <FieldWithIcon
          icon={<IconBrandX size={15} />}
          label="Twitter / X URL"
          value={data.twitter}
          placeholder="https://twitter.com/…"
          onChange={(v) => set('twitter', v)}
        />
      </div>

      <p className="text-[11px] text-white/25 leading-relaxed">
        These links appear on your public profile so candidates can research your company before applying.
      </p>
    </div>
  )
}
