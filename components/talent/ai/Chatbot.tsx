'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMapPin, IconSend } from '@tabler/icons-react'

interface JobCardData {
  id: string
  title: string
  company: string
  location: string | null
  type: string | null
  salary: string | null
  tags: string[]
  reason?: string
}

interface ChatMessage {
  id: number
  role: 'ai' | 'user'
  text: string
  jobs?: JobCardData[]
}

export default function Chatbot() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: 'ai', text: "Hey! I'm Crucible AI — your career assistant, forged with a little extra fire. How can I help you stand out today?" }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return

    const newUserMessage: ChatMessage = { id: Date.now(), role: 'user', text: inputValue }
    const history = [...messages, newUserMessage]
    setMessages(history)
    setInputValue('')
    setIsSending(true)

    try {
      const res = await fetch('/api/talent/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        }),
      })

      if (!res.ok) throw new Error('AI chat request failed')
      const data = await res.json()

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply, jobs: data.jobs }])
    } catch (err) {
      console.error('Crucible AI chat failed:', err)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: "Sorry, I'm having trouble responding right now — please try again in a moment.",
      }])
    } finally {
      setIsSending(false)
    }
  }

  const handleApplyNow = (jobId: string) => {
    setIsOpen(false)
    router.push(`/talent/dashboard?tab=jobs&job=${jobId}`)
  }

  return (
    <div className="theme-transition-exempt fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '450px' }}
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Crucible AI</h3>
                  <p className="text-xs text-white/80">Career Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-[#FF6B00] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="w-full max-w-[92%] space-y-2">
                      {msg.jobs.map((job) => (
                        <div key={job.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                          <div className="text-sm font-semibold text-gray-900">{job.title}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                            <span>{job.company}</span>
                            {job.location && (
                              <>
                                <span>·</span>
                                <IconMapPin size={11} className="shrink-0" />
                                <span>{job.location}</span>
                              </>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                            {job.type && <span className="rounded-full bg-gray-50 px-2 py-0.5 border border-gray-100">{job.type}</span>}
                            {job.salary && <span className="rounded-full bg-gray-50 px-2 py-0.5 border border-gray-100">{job.salary}</span>}
                            {job.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700 border border-orange-100">{tag}</span>
                            ))}
                          </div>
                          {job.reason && (
                            <p className="mt-1.5 text-xs italic leading-snug text-gray-500">{job.reason}</p>
                          )}
                          <button
                            onClick={() => handleApplyNow(job.id)}
                            className="mt-2 w-full rounded-lg bg-[#FF6B00] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#E66000]"
                          >
                            Apply Now
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none border border-gray-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-gray-300" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-gray-300" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }} />
                      <motion.span className="h-1.5 w-1.5 rounded-full bg-gray-300" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all disabled:opacity-60"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="w-10 h-10 bg-[#FF6B00] text-white rounded-full flex items-center justify-center hover:bg-[#E66000] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <IconSend size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-[#FF6B00] to-[#FF914D] text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  )
}
