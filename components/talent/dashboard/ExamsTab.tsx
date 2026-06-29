"use client";
import { motion } from 'framer-motion'

const DEMO_EXAMS = [
  { id: '1', title: 'Certified AI Engineer', duration: '90 mins', questions: 60, level: 'Advanced', status: 'Available', type: 'Proctored' },
  { id: '2', title: 'React Performance Master', duration: '60 mins', questions: 40, level: 'Intermediate', status: 'Completed', score: '92%', badge: 'React Master', type: 'Proctored' },
  { id: '3', title: 'System Design Fundamentals', duration: '120 mins', questions: 50, level: 'Expert', status: 'Available', type: 'Proctored' },
  { id: '4', title: 'Fullstack Next.js Developer', duration: '60 mins', questions: 45, level: 'Intermediate', status: 'Completed', score: '88%', badge: 'Next.js Dev', type: 'Proctored' }
]

export default function ExamsTab() {
  const availableExams = DEMO_EXAMS.filter(e => e.status === 'Available')
  const completedExams = DEMO_EXAMS.filter(e => e.status === 'Completed')

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">
      {/* Left Column: Available Exams (col-span-5) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-5">
        <div className="border-b border-gray-200 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Assessments</p>
          <h1 className="mt-1 text-2xl font-semibold">Available Exams</h1>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-3.5">
          {availableExams.map((exam, idx) => (
            <motion.div 
              key={exam.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between gap-3.5 hover:border-orange-200 transition-all hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{exam.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 mt-1.5 font-medium">
                    <span className="flex items-center gap-1">⏱️ {exam.duration}</span>
                    <span className="flex items-center gap-1">📋 {exam.questions} Questions</span>
                    <span className="flex items-center gap-1">🛡️ {exam.type}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 shrink-0 shadow-sm">
                  {exam.level}
                </span>
              </div>
              <button className="w-full py-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all text-center cursor-pointer">
                Take Exam
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Right Column: Earned Badges (col-span-4) */}
      <section className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-[24px] shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)] flex flex-col overflow-hidden lg:col-span-4">
        <div className="border-b border-gray-200 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00]">Achievements</p>
          <h1 className="mt-1 text-2xl font-semibold">Earned Badges</h1>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {completedExams.map((exam, idx) => (
              <motion.div 
                key={exam.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative bg-gradient-to-br from-white to-orange-50/50 border border-orange-100 rounded-2xl p-4 text-center hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[140px]"
              >
                <div className="absolute top-2.5 right-2.5 text-[10px] font-bold text-[#FF6B00] bg-orange-100 px-2 py-0.5 rounded shadow-sm">
                  {exam.score} Score
                </div>
                <div className="w-12 h-12 bg-gradient-to-tr from-[#FF6B00] to-[#FF914D] rounded-full flex items-center justify-center mb-3 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{exam.badge}</h3>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{exam.title}</p>
              </motion.div>
            ))}
            {completedExams.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">
                No badges earned yet. Take an exam on the left to get started!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
