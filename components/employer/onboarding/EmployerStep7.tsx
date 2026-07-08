'use client'

import { motion } from 'framer-motion'
import { IconBuildingSkyscraper, IconUsers, IconRocket } from '@tabler/icons-react'

interface Props {
  companyName: string
  industry: string
  companySize: string
  onExplore: () => void
}

const STAT_ITEMS = [
  { icon: IconBuildingSkyscraper, label: 'Profile ready', desc: 'Live for candidates' },
  { icon: IconUsers, label: 'Smart matching', desc: 'AI-powered talent discovery' },
  { icon: IconRocket, label: 'Post your first job', desc: 'Takes 2 minutes' },
]

export default function EmployerStep7({ companyName, industry, companySize, onExplore }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-2">
      {/* Confetti-style celebration SVG */}
      <div className="relative w-full h-28 overflow-hidden">
        <svg
          viewBox="0 0 400 110"
          className="absolute inset-0 w-full h-full"
          fill="none"
        >
          {/* Burst lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * 360
            const rad = (angle * Math.PI) / 180
            const x1 = 200 + Math.cos(rad) * 24
            const y1 = 55 + Math.sin(rad) * 24
            const x2 = 200 + Math.cos(rad) * 46
            const y2 = 55 + Math.sin(rad) * 46
            return (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#FF914D' : '#a78bfa'}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
              />
            )
          })}

          {/* Floating confetti rectangles */}
          {[
            { x: 60, y: 20, w: 8, h: 5, fill: '#FF6B00', delay: 0.4, dur: 3 },
            { x: 330, y: 15, w: 6, h: 4, fill: '#a78bfa', delay: 0.6, dur: 3.5 },
            { x: 100, y: 70, w: 5, h: 8, fill: '#34d399', delay: 0.5, dur: 4 },
            { x: 290, y: 75, w: 7, h: 5, fill: '#FF914D', delay: 0.7, dur: 3.2 },
            { x: 150, y: 10, w: 6, h: 4, fill: '#fbbf24', delay: 0.45, dur: 2.8 },
            { x: 250, y: 85, w: 5, h: 7, fill: '#60a5fa', delay: 0.65, dur: 3.8 },
          ].map((c, i) => (
            <motion.rect
              key={i}
              x={c.x} y={c.y} width={c.w} height={c.h}
              rx={1.5}
              fill={c.fill}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: [0, 1, 0.8, 0], y: [0, 20, 40] }}
              transition={{ delay: c.delay, duration: c.dur, repeat: Infinity, ease: 'easeIn' }}
            />
          ))}
        </svg>

        {/* Central check circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-[0_0_40px_rgba(255,107,0,0.35)]"
          >
            <motion.svg
              width="26" height="26" viewBox="0 0 24 24"
              fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.45, duration: 0.55, ease: 'easeOut' }}
              />
            </motion.svg>
          </motion.div>
        </div>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
        className="space-y-2"
      >
        <h2 className="text-2xl font-bold text-white leading-snug">
          {companyName ? (
            <><span className="text-[#FF6B00]">{companyName}</span> is live 🎉</>
          ) : (
            <>You&rsquo;re all set 🎉</>
          )}
        </h2>
        {(industry || companySize) && (
          <p className="text-sm text-white/40">
            {[industry, companySize].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-sm text-white/40 max-w-[280px] mx-auto leading-relaxed">
          Your profile is ready. Post your first job and start discovering top talent.
        </p>
      </motion.div>

      {/* Stat items */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="w-full space-y-2"
      >
        {STAT_ITEMS.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1, duration: 0.35 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center shrink-0">
              <Icon size={15} className="text-[#FF914D]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/75">{label}</div>
              <div className="text-[11px] text-white/35">{desc}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onExplore}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
      >
        Go to my dashboard →
      </motion.button>
    </div>
  )
}
