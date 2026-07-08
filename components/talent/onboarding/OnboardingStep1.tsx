'use client'

import { motion } from 'framer-motion'

// Floating job card data
const CARDS = [
  { label: 'React Developer', sub: 'Remote · Full-time', color: '#FF6B00', x: -130, y: -30, delay: 0.6 },
  { label: 'Product Manager', sub: 'Hybrid · Senior', color: '#6366f1', x: 110, y: -50, delay: 0.75 },
  { label: 'UI/UX Designer', sub: 'Remote · Contract', color: '#10b981', x: -100, y: 90, delay: 0.9 },
]

// Sparkle positions (decorative SVG stars)
const SPARKLES = [
  { x: 48, y: 8, size: 8, delay: 0.5, dur: 2.2 },
  { x: 8, y: 52, size: 6, delay: 0.9, dur: 2.8 },
  { x: 88, y: 20, size: 5, delay: 1.2, dur: 2.4 },
  { x: 78, y: 72, size: 7, delay: 0.7, dur: 3.0 },
  { x: 22, y: 78, size: 5, delay: 1.4, dur: 2.6 },
]

function SparkleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8 Z"
        fill="#FF6B00"
        opacity="0.7"
      />
    </svg>
  )
}

function FloatingCard({ label, sub, color, x, y, delay }: (typeof CARDS)[number]) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, x: x * 0.3, y: y * 0.3 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: [x, x + 4, x - 3, x],
        y: [y, y - 5, y + 3, y],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        scale: { delay, duration: 0.5, type: 'spring', stiffness: 260, damping: 20 },
        x: { delay: delay + 0.5, duration: 5, repeat: Infinity, ease: 'easeInOut' },
        y: { delay: delay + 0.5, duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
      }}
      style={{ position: 'absolute', left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
      className="pointer-events-none select-none"
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border shadow-[0_4px_16px_rgba(0,0,0,0.08)] whitespace-nowrap"
        style={{ borderColor: `${color}28` }}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
        />
        <div>
          <div className="text-[11px] font-semibold text-gray-800 leading-none mb-0.5">{label}</div>
          <div className="text-[9px] text-gray-400 leading-none">{sub}</div>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  firstName: string
}

export default function OnboardingStep1({ firstName }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-1">
      {/* ── Illustration area ── */}
      <div className="relative w-full h-56 overflow-visible">
        {/* Ambient glow blobs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center overflow-visible"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-36 h-36 rounded-full bg-orange-400 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute w-44 h-44 rounded-full bg-[#FF914D] blur-3xl"
          />
        </motion.div>

        {/* Concentric ring SVGs */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[65, 90, 110].map((r, i) => (
            <motion.svg
              key={r}
              className="absolute"
              width={r * 2}
              height={r * 2}
              viewBox={`0 0 ${r * 2} ${r * 2}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.6 }}
            >
              <motion.circle
                cx={r}
                cy={r}
                r={r - 1}
                fill="none"
                stroke="#FF6B00"
                strokeWidth={i === 0 ? 1.5 : 0.75}
                strokeOpacity={i === 0 ? 0.25 : 0.1}
                strokeDasharray={i === 2 ? '5 8' : undefined}
                animate={{ rotate: i === 2 ? 360 : i === 1 ? -360 : 0 }}
                transition={{ duration: i === 2 ? 22 : 30, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: `${r}px ${r}px` }}
              />
              {/* Orbiting dot on ring 0 */}
              {i === 0 && (
                <motion.circle
                  r={3.5}
                  fill="#FF6B00"
                  animate={{
                    cx: [r + r - 1, r, r - (r - 1), r, r + r - 1],
                    cy: [r, r + r - 1, r, r - (r - 1), r],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.svg>
          ))}
        </div>

        {/* Central icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
            className="relative w-16 h-16"
          >
            {/* Pulse rings on icon */}
            {[1, 2].map((n) => (
              <motion.div
                key={n}
                className="absolute inset-0 rounded-2xl bg-orange-400"
                animate={{ scale: [1, 1.5 + n * 0.25], opacity: [0.35, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: n * 0.5 }}
              />
            ))}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-[0_12px_32px_rgba(255,107,0,0.4)]">
              {/* Custom SVG briefcase */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
                />
                <motion.path
                  d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9, ease: 'easeOut' }}
                />
                <motion.line
                  x1="2" y1="13" x2="22" y2="13"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.1, ease: 'easeOut' }}
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Floating job cards */}
        {CARDS.map((c) => (
          <FloatingCard key={c.label} {...c} />
        ))}

        {/* Sparkle SVG stars */}
        {SPARKLES.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ delay: s.delay, duration: s.dur, repeat: Infinity, ease: 'easeInOut' }}
          >
            <SparkleIcon size={s.size} />
          </motion.div>
        ))}
      </div>

      {/* ── Copy ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="space-y-2.5"
      >
        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
          {firstName ? (
            <>Welcome, <span className="text-[#FF6B00]">{firstName}</span> 👋</>
          ) : (
            <>Your dream job<br /><span className="text-[#FF6B00]">starts here</span></>
          )}
        </h2>
        <p className="text-sm text-gray-500 max-w-[280px] mx-auto leading-relaxed">
          Build your profile once, and let the best opportunities find you — matched by your skills and goals.
        </p>
      </motion.div>

      {/* ── Chips ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {[
          { icon: '⏱', label: '~5 minutes' },
          { icon: '✏️', label: 'Editable anytime' },
          { icon: '🔍', label: 'Seen by employers' },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white/80 text-[11px] text-gray-500 font-medium shadow-sm"
          >
            <span>{icon}</span>
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
