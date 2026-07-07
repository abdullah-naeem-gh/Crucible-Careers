'use client'

import { motion } from 'framer-motion'
import { IconPlus, IconBrandLinkedin, IconBrandGithub, IconWorld, IconVideo } from '@tabler/icons-react'
import type { TalentProject } from '@/types/talent/profile'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-gray-400'
const F = 'w-full rounded-xl border border-gray-200 bg-white/70 px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 transition-all'

export function newProject(): TalentProject {
  return {
    id: `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: '', description: '', link: '', imageDataUrl: null, videoUrl: '',
  }
}

export interface Step7Data {
  projects: TalentProject[]
  overview: string
  linkedin: string
  github: string
  portfolio: string
  introVideoUrl: string
}

interface Props {
  data: Step7Data
  onChange: (data: Step7Data) => void
}

export default function OnboardingStep7({ data, onChange }: Props) {
  const set = <K extends keyof Step7Data>(key: K, value: Step7Data[K]) =>
    onChange({ ...data, [key]: value })

  const updateProject = (id: string, patch: Partial<TalentProject>) =>
    set('projects', data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const removeProject = (id: string) =>
    set('projects', data.projects.filter((p) => p.id !== id))

  return (
    <div className="space-y-5">
      <div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl font-bold text-gray-900">Finish with projects & links</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="mt-1 text-sm text-gray-500">Proof of work and your online presence.</motion.p>
      </div>

      {/* Overview */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <label className={L}>Overview / Bio <span className="normal-case font-normal tracking-normal text-gray-400">(optional)</span></label>
        <textarea
          className={F}
          rows={3}
          value={data.overview}
          onChange={(e) => set('overview', e.target.value)}
          placeholder="Write a concise client-facing profile overview — your story in 2-3 sentences."
          maxLength={500}
        />
        <p className="text-right text-[10px] text-gray-400 mt-1">{data.overview.length}/500</p>
      </motion.div>

      {/* Links */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <label className={L}>Links</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <IconBrandLinkedin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
            <input className={F + ' pl-8'} value={data.linkedin}
              onChange={(e) => set('linkedin', e.target.value)}
              placeholder="linkedin.com/in/..." />
          </div>
          <div className="relative">
            <IconBrandGithub size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input className={F + ' pl-8'} value={data.github}
              onChange={(e) => set('github', e.target.value)}
              placeholder="github.com/..." />
          </div>
          <div className="relative">
            <IconWorld size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]" />
            <input className={F + ' pl-8'} value={data.portfolio}
              onChange={(e) => set('portfolio', e.target.value)}
              placeholder="your-site.com" />
          </div>
          <div className="relative">
            <IconVideo size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF6B00]" />
            <input className={F + ' pl-8'} value={data.introVideoUrl}
              onChange={(e) => set('introVideoUrl', e.target.value)}
              placeholder="Loom or YouTube link" />
          </div>
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-2">
          <label className={L}>Project proofs <span className="normal-case font-normal tracking-normal text-gray-400">(optional)</span></label>
          <button
            type="button"
            onClick={() => set('projects', [...data.projects, newProject()])}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-[11px] font-semibold text-[#FF6B00] hover:bg-orange-100 transition-all"
          >
            <IconPlus size={12} /> Add project
          </button>
        </div>

        <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {data.projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-5 text-center">
              <p className="text-sm text-gray-400">No projects added yet — tap &ldquo;Add project&rdquo; above.</p>
            </div>
          ) : (
            data.projects.map((item, index) => (
              <div key={item.id}
                className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Project {index + 1}
                  </span>
                  <button type="button" onClick={() => removeProject(item.id)}
                    className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors">
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={L}>Title</label>
                    <input className={F} value={item.title}
                      onChange={(e) => updateProject(item.id, { title: e.target.value })}
                      placeholder="AI recruiting dashboard" />
                  </div>
                  <div>
                    <label className={L}>Link</label>
                    <input type="url" className={F} value={item.link}
                      onChange={(e) => updateProject(item.id, { link: e.target.value })}
                      placeholder="https://..." />
                  </div>
                  <div>
                    <label className={L}>Video URL</label>
                    <input type="url" className={F} value={item.videoUrl}
                      onChange={(e) => updateProject(item.id, { videoUrl: e.target.value })}
                      placeholder="Loom or YouTube" />
                  </div>
                  <div className="col-span-2">
                    <label className={L}>Summary</label>
                    <textarea className={F} rows={2} value={item.description}
                      onChange={(e) => updateProject(item.id, { description: e.target.value })}
                      placeholder="Problem, your role, result." />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
