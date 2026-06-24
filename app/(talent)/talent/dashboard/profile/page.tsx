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

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full w-full grid grid-cols-12 gap-8 px-6">
          <TalentSidebar />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your professional profile and preferences</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{profile.matchScore}%</div>
                  <div className="text-sm text-gray-500">Match Score</div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D]"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-auto">
              <div className="lg:col-span-1">
                <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg sticky top-0">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF914D] mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{profile.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.title}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profile.experience}
                        onChange={(e) => setProfile(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.experience} years</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.education}
                        onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.education}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Social Links</h3>
                  <div className="space-y-2">
                    {profile.linkedin && (
                      <a href={`https://${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {profile.github && (
                      <a href={`https://${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {profile.portfolio && (
                      <a href={`https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                )}
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
                      <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <p className="text-sm font-medium text-gray-700">Click to upload resume (.pdf, .doc)</p>
                      <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Or paste resume text</label>
                      <textarea
                        rows={5}
                        placeholder="Paste your resume text here..."
                        value={profile.resumeText || ''}
                        onChange={(e) => setProfile(prev => ({ ...prev, resumeText: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {profile.resumeFilename ? (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{profile.resumeFilename}</span>
                        </div>
                        <button className="text-sm text-[#FF6B00] hover:underline font-medium px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">View</button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No resume uploaded.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                  {isEditing && (
                    <button className="text-sm text-[#FF6B00] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors font-medium">+ Add Experience</button>
                  )}
                </div>
                <div className="space-y-6">
                  {profile.experienceList.map(exp => (
                    <div key={exp.id} className="relative group border-l-2 border-orange-100 pl-4">
                      {isEditing && (
                        <button className="absolute -right-2 -top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                      <h4 className="font-bold text-gray-900 text-base">{exp.role}</h4>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span className="font-medium text-[#FF6B00]">{exp.company}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                  {profile.experienceList.length === 0 && <p className="text-sm text-gray-500">No work experience added.</p>}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                  {isEditing && (
                    <button className="text-sm text-[#FF6B00] hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors font-medium">+ Add Project</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.projectsList.map(proj => (
                    <div key={proj.id} className="bg-white border border-gray-100 rounded-xl p-5 relative group hover:border-orange-200 hover:shadow-md transition-all">
                      {isEditing && (
                        <button className="absolute -right-2 -top-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm border border-gray-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                      <h4 className="font-bold text-gray-900 text-base mb-1">{proj.title}</h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{proj.description}</p>
                      {proj.link && (
                        <a href={`https://${proj.link}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#FF6B00] hover:text-[#FF914D] flex items-center gap-1 w-fit">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                  {profile.projectsList.length === 0 && <p className="col-span-full text-sm text-gray-500">No projects added.</p>}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                  {isEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add skill"
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <button
                        onClick={addSkill}
                        className="px-3 py-1 text-sm bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF914D]"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Earned Badges</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.badges.map(badge => (
                    <div key={badge.id} className="relative bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B00] to-[#FF914D] rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{badge.badge}</h4>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{badge.title}</p>
                      </div>
                      <div className="absolute top-2 right-2 text-[10px] font-bold text-[#FF6B00] bg-orange-100 px-1.5 py-0.5 rounded">
                        {badge.score}
                      </div>
                    </div>
                  ))}
                  {profile.badges.length === 0 && (
                    <div className="col-span-full text-sm text-gray-500 py-2">
                      No badges earned yet. Complete exams to earn badges!
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Basic Information</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full">
                        <div className="w-full h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Skills & Experience</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full">
                        <div className="w-20 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">83%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portfolio & Links</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full">
                        <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">67%</span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 rounded-lg text-white bg-gradient-to-r from-[#FF6B00] to-[#FF914D] hover:from-[#FF914D] hover:to-[#FF6B00] transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>
    </main>
  )
}
