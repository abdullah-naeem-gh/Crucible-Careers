'use client'

import { motion } from 'framer-motion'
import TalentSidebar from '@/components/talent/sidebar/TalentSidebar'

const DEMO_EXAMS = [
  { id: '1', title: 'Certified AI Engineer', duration: '90 mins', questions: 60, level: 'Advanced', status: 'Available', type: 'Proctored' },
  { id: '2', title: 'React Performance Master', duration: '60 mins', questions: 40, level: 'Intermediate', status: 'Completed', score: '92%', badge: 'React Master', type: 'Proctored' },
  { id: '3', title: 'System Design Fundamentals', duration: '120 mins', questions: 50, level: 'Expert', status: 'Available', type: 'Proctored' },
  { id: '4', title: 'Fullstack Next.js Developer', duration: '60 mins', questions: 45, level: 'Intermediate', status: 'Completed', score: '88%', badge: 'Next.js Dev', type: 'Proctored' }
]

export default function ExamsPage() {
  const availableExams = DEMO_EXAMS.filter(e => e.status === 'Available')
  const completedExams = DEMO_EXAMS.filter(e => e.status === 'Completed')

  return (
    <main className="min-h-screen w-full relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-gray-50" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <section className="relative z-10 h-screen">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-8 px-6">
          <TalentSidebar jobCount={0} />

          <div className="col-span-9 grid grid-cols-1 gap-8 h-[92vh] self-center overflow-y-auto pr-4 pb-12 pt-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exams & Badges</h1>
                <p className="text-gray-600 mt-1">Take proctored exams to earn verified badges and stand out to employers.</p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#FF6B00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                Earned Badges
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedExams.map((exam, idx) => (
                  <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative bg-gradient-to-br from-white to-orange-50 border border-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all"
                  >
                    <div className="absolute top-4 right-4 text-xs font-bold text-[#FF6B00] bg-orange-100 px-2 py-1 rounded-md">
                      {exam.score}
                    </div>
                    <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#FF6B00] to-[#FF914D] rounded-full flex items-center justify-center mb-4 shadow-md">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{exam.badge}</h3>
                    <p className="text-sm text-gray-500">{exam.title}</p>
                  </motion.div>
                ))}
                {completedExams.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    You haven't earned any badges yet. Take an exam below to get started!
                  </div>
                )}
              </div>
            </div>

            {/* Available Exams Section */}
            <div className="bg-white/60 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                Available Exams
              </h2>
              
              <div className="space-y-4">
                {availableExams.map((exam, idx) => (
                  <motion.div 
                    key={exam.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-orange-200 hover:shadow-md transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors">{exam.title}</h3>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">{exam.level}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {exam.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {exam.questions} Questions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                          {exam.type}
                        </span>
                      </div>
                    </div>
                    <button className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      Take Exam
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
