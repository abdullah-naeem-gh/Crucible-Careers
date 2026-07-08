'use client'

import { motion } from 'framer-motion'
import LocationPicker from '@/components/ui/LocationPicker'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400'
const F = 'w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all'

export interface Step2Data {
  headline: string
  location: string
  languagesStr: string
}

interface Props {
  data: Step2Data
  onChange: (data: Step2Data) => void
}

export default function OnboardingStep2({ data, onChange }: Props) {
  const set = (key: keyof Step2Data, value: string) => onChange({ ...data, [key]: value })

  return (
    <div className="space-y-4">
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900"
        >
          Start with the essentials
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-1 text-sm text-gray-500"
        >
          This is what employers see first on your profile.
        </motion.p>
      </div>


      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <label className={L}>Professional headline <span className="text-red-400">*</span></label>
        <input
          className={F}
          value={data.headline}
          onChange={(e) => set('headline', e.target.value)}
          placeholder="Frontend engineer building polished SaaS apps"
          maxLength={100}
        />
        <p className="mt-1 text-right text-[10px] text-gray-400">{data.headline.length}/100</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className={L}>Location</label>
        <LocationPicker value={data.location} onChange={(v) => set('location', v)} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <label className={L}>Languages</label>
        <input
          className={F}
          value={data.languagesStr}
          onChange={(e) => set('languagesStr', e.target.value)}
          placeholder="English, Urdu"
        />
        <p className="mt-1 text-[10px] text-gray-400">Separate with commas</p>
      </motion.div>
    </div>
  )
}
