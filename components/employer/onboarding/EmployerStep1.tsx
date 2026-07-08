'use client'

import { motion } from 'framer-motion'

// Floating "candidate" cards — dark style
const CARDS = [
  { label: 'Sarah K.', sub: 'Senior Engineer · 6 yrs', accent: '#FF6B00', x: -135, y: -40, delay: 0.65 },
  { label: 'James R.', sub: 'Product Lead · Available', accent: '#a78bfa', x: 120, y: -55, delay: 0.8 },
  { label: 'Mia T.', sub: 'UX Designer · Remote', accent: '#34d399', x: -105, y: 88, delay: 0.95 },
]

const SPARKLES = [
  { x: 50, y: 6, size: 8, delay: 0.5, dur: 2.3 },
  { x: 10, y: 54, size: 6, delay: 1.0, dur: 2.9 },
  { x: 86, y: 18, size: 5, delay: 1.3, dur: 2.5 },
  { x: 76, y: 74, size: 7, delay: 0.75, dur: 3.1 },
  { x: 24, y: 80, size: 5, delay: 1.5, dur: 2.7 },
]

function SparkleIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 0 L9.2 6.8 L16 8 L9.2 9.2 L8 16 L6.8 9.2 L0 8 L6.8 6.8 Z"
        fill="#FF6B00"
        opacity="0.55"
      />
    </svg>
  )
}

function FloatingCard({
  label, sub, accent, x, y, delay,
}: (typeof CARDS)[number]) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, x: x * 0.3, y: y * 0.3 }}
      animate={{
        opacity: 1, scale: 1,
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl border whitespace-nowrap"
        style={{
          background: 'rgba(255,255,255,0.045)',
          borderColor: `${accent}30`,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Avatar circle */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{ background: `${accent}25`, color: accent }}
        >
          {label.split(' ').map(w => w[0]).join('')}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white/85 leading-none mb-0.5">{label}</div>
          <div className="text-[9px] text-white/40 leading-none">{sub}</div>
        </div>
      </div>
    </motion.div>
  )
}

interface Props {
  companyName: string
}

export default function EmployerStep1({ companyName }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-1">
      {/* ── Illustration ── */}
      <div className="relative w-full h-56 overflow-visible">
        {/* Ambient glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center overflow-visible"
        >
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-36 h-36 rounded-full bg-orange-500 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.07, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute w-48 h-48 rounded-full bg-[#FF914D] blur-3xl"
          />
        </motion.div>

        {/* Concentric dark rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[65, 90, 112].map((r, i) => (
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
                strokeOpacity={i === 0 ? 0.3 : 0.12}
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

        {/* Central building icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
            className="relative w-16 h-16"
          >
            {/* Pulse rings */}
            {[1, 2].map((n) => (
              <motion.div
                key={n}
                className="absolute inset-0 rounded-2xl bg-orange-500"
                animate={{ scale: [1, 1.5 + n * 0.25], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: n * 0.5 }}
              />
            ))}
            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center shadow-[0_12px_32px_rgba(255,107,0,0.45)]">
              {/* Office/building SVG that draws itself */}
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                {/* Building body */}
                <motion.rect
                  x="3" y="4" width="18" height="17"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                />
                {/* Roof line / top */}
                <motion.path
                  d="M3 4 L12 1 L21 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.85, ease: 'easeOut' }}
                />
                {/* Door */}
                <motion.path
                  d="M9 21V15h6v6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.35, delay: 1.1, ease: 'easeOut' }}
                />
                {/* Windows */}
                <motion.rect x="7" y="7" width="2.5" height="2.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.25 }}
                />
                <motion.rect x="14.5" y="7" width="2.5" height="2.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.25 }}
                />
                <motion.rect x="7" y="11.5" width="2.5" height="2.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.25 }}
                />
                <motion.rect x="14.5" y="11.5" width="2.5" height="2.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.25 }}
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Floating candidate cards */}
        {CARDS.map((c) => (
          <FloatingCard key={c.label} {...c} />
        ))}

        {/* Sparkles */}
        {SPARKLES.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 0.85, 0], scale: [0.5, 1.2, 0.5] }}
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
        <h2 className="text-2xl font-bold text-white leading-snug">
          {companyName ? (
            <>Welcome, <span className="text-[#FF6B00]">{companyName}</span> 👋</>
          ) : (
            <>Your next great hire<br /><span className="text-[#FF6B00]">starts here</span></>
          )}
        </h2>
        <p className="text-sm text-white/45 max-w-[280px] mx-auto leading-relaxed">
          Set up your company profile once — and let top talent discover you through smart matching.
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
          { icon: '⏱', label: '~4 minutes' },
          { icon: '✏️', label: 'Editable anytime' },
          { icon: '👤', label: 'Seen by candidates' },
        ].map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] text-[11px] text-white/50 font-medium"
          >
            <span>{icon}</span>
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
