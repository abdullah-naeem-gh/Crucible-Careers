'use client'

import { useState } from 'react'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

interface Project {
  id: string
  title: string
  description: string
  link?: string
}

interface Profile {
  name: string
  title: string
  email: string
  location: string
  bio: string
  experience: number
  skills: string[]
  education: string
  linkedin?: string
  github?: string
  portfolio?: string
  matchScore: number
  badges: { id: string, title: string, badge: string, score: string }[]
  resumeFilename?: string
  resumeText?: string
  experienceList: Experience[]
  projectsList: Project[]
}

const DEMO_PROFILE: Profile = {
  name: 'Alex Johnson',
  title: 'Frontend Engineer',
  email: 'alex.johnson@email.com',
  location: 'San Francisco, CA',
  bio: 'Passionate frontend engineer with 5+ years of experience building scalable web applications. Specialized in React, TypeScript, and modern frontend architectures. Love creating intuitive user experiences and mentoring junior developers.',
  experience: 5,
  skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Tailwind CSS', 'Next.js', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker'],
  education: 'B.S. Computer Science, Stanford University',
  linkedin: 'linkedin.com/in/alexjohnson',
  github: 'github.com/alexjohnson',
  portfolio: 'alexjohnson.dev',
  matchScore: 86,
  badges: [
    { id: '2', title: 'React Performance Master', score: '92%', badge: 'React Master' },
    { id: '4', title: 'Fullstack Next.js Developer', score: '88%', badge: 'Next.js Dev' }
  ],
  resumeFilename: 'Alex_Johnson_Resume_2026.pdf',
  experienceList: [
    { id: 'e1', company: 'TechCorp', role: 'Frontend Engineer', duration: '2021 - Present', description: 'Led the frontend team in building a scalable React architecture. Improved rendering performance by 40%.' },
    { id: 'e2', company: 'WebSolutions Inc.', role: 'Junior Developer', duration: '2019 - 2021', description: 'Developed responsive web applications using Vue.js and Tailwind CSS. Implemented CI/CD pipelines.' }
  ],
  projectsList: [
    { id: 'p1', title: 'Open Source UI Library', description: 'A collection of accessible React components with Tailwind.', link: 'github.com/alexjohnson/ui-lib' },
    { id: 'p2', title: 'Crypto Dashboard', description: 'Real-time cryptocurrency tracking app using WebSockets.', link: 'alexjohnson.dev/crypto' }
  ]
}

export default function TalentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE)
  const [newSkill, setNewSkill] = useState('')

  const handleSave = () => {
    setIsEditing(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const labelClass = 'block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5'
  const inputClass = 'w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-white/50'

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-gray-50 text-gray-900">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <section className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:h-screen lg:py-0">
        <div className="mx-auto grid min-h-full max-w-[1500px] grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-7">
          <div className="lg:col-span-3 lg:self-center">
            <TalentSidebar />
          </div>

          <div className="min-h-[70vh] lg:col-span-9 lg:h-[92vh] lg:self-center">
            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
              {/* Left Column: Personal details & skills (col-span-5) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
                <div className="border-b border-gray-100 px-5 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Profile</p>
                    <h1 className="mt-1 text-2xl font-semibold">Personal Details</h1>
                  </div>
                  <button
                    onClick={() => {
                      if (isEditing) handleSave()
                      else setIsEditing(true)
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:opacity-95 transition-opacity"
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  {/* Bio Card in Left Column */}
                  <div className="text-center pb-6 border-b border-gray-100">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] mx-auto mb-3 flex items-center justify-center shadow-md">
                      <span className="text-xl font-bold text-white">{profile.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className={`${inputClass} text-center font-bold text-sm`}
                        />
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                          className={`${inputClass} text-center`}
                        />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-xs text-gray-500">{profile.title}</p>
                      </>
                    )}
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-xs text-gray-800 font-medium">{profile.email}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.location}
                            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                            className={inputClass}
                          />
                        ) : (
                          <p className="text-xs text-gray-800 font-medium">{profile.location}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>Experience (Years)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={profile.experience}
                            onChange={(e) => setProfile(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                            className={inputClass}
                          />
                        ) : (
                          <p className="text-xs text-gray-800 font-medium">{profile.experience} years</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Education</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.education}
                          onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                          className={inputClass}
                        />
                      ) : (
                        <p className="text-xs text-gray-800 font-medium">{profile.education}</p>
                      )}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Skills & Core Competencies</h3>
                      {isEditing && (
                        <div className="flex gap-1.5 max-w-[150px]">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add skill"
                            className="px-2 py-1 text-[10px] border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-200"
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          />
                          <button
                            onClick={addSkill}
                            className="px-2.5 py-1 text-[10px] bg-[#FF6B00] text-white rounded font-medium hover:opacity-90"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-150 text-xs text-gray-700 font-medium">
                          {skill}
                          {isEditing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-gray-400 hover:text-red-500 font-semibold"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Social Links</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {profile.linkedin && (
                        <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                          🔗 LinkedIn
                        </a>
                      )}
                      {profile.github && (
                        <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-gray-700 hover:underline">
                          💻 GitHub
                        </a>
                      )}
                      {profile.portfolio && (
                        <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-orange-600 hover:underline col-span-2">
                          🌐 Portfolio Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Profile Completion</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Basic Information</span>
                        <span className="font-semibold text-green-700">100%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Skills & Experience</span>
                        <span className="font-semibold text-green-700">83%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '83%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Right Column: Experience, Bio, Projects, Badges (col-span-4) */}
              <section className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] overflow-auto p-6 lg:col-span-4">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Professional</p>
                  <h2 className="mt-1 text-xl font-semibold">Experience & Projects</h2>
                </div>

                <div className="space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">About Me</h3>
                    {isEditing ? (
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none bg-white/50"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                    )}
                  </div>

                  {/* Resume upload */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2.5">Resume File</h3>
                    {isEditing ? (
                      <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-gray-50/50 hover:bg-gray-50 flex flex-col items-center justify-center text-center">
                        <svg className="w-6 h-6 text-gray-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="text-xs font-semibold text-gray-700">Upload new resume (.pdf)</p>
                      </div>
                    ) : (
                      profile.resumeFilename ? (
                        <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-150">
                          <span className="text-xs font-medium text-gray-700">{profile.resumeFilename}</span>
                          <button className="text-[10px] font-bold text-[#FF6B00] bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">View</button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">No resume uploaded.</p>
                      )
                    )}
                  </div>

                  {/* Experience List */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Work Experience</h3>
                    <div className="space-y-4">
                      {profile.experienceList.map(exp => (
                        <div key={exp.id} className="border-l-2 border-orange-200 pl-3">
                          <h4 className="text-xs font-bold text-gray-900">{exp.role}</h4>
                          <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                            <span className="text-[#FF6B00] font-semibold">{exp.company}</span>
                            <span>{exp.duration}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects List */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Recent Projects</h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {profile.projectsList.map(proj => (
                        <div key={proj.id} className="bg-gray-50/50 border border-gray-150 rounded-xl p-3">
                          <h4 className="text-xs font-bold text-gray-900">{proj.title}</h4>
                          <p className="text-[11px] text-gray-600 mt-1 mb-2 line-clamp-2">{proj.description}</p>
                          {proj.link && (
                            <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1">
                              View Project ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Earned Badges */}
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Earned Badges</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {profile.badges.map(badge => (
                        <div key={badge.id} className="relative bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 rounded-xl p-2.5 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-tr from-[#FF6B00] to-[#FF914D] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 text-[10px] truncate leading-tight">{badge.badge}</h4>
                            <p className="text-[9px] text-gray-400 truncate">{badge.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
