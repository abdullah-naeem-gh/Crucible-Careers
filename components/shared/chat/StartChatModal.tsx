'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconX, IconSend, IconMessageCircle } from '@tabler/icons-react'
import type { ChatParticipantRole } from '@/types/shared/chat'
import { openOrCreateConversation, listConversations } from '@/lib/shared/chat/chat.service'

interface StartChatModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called after the conversation is created/opened with the conversation id */
  onSuccess: (conversationId: string) => void
  applicationId: string
  jobId: string
  jobTitle: string
  companyName: string
  talentName: string
  talentEmail: string
  initiatedBy: ChatParticipantRole
  isDark?: boolean
}

export default function StartChatModal({
  isOpen,
  onClose,
  onSuccess,
  applicationId,
  jobId,
  jobTitle,
  companyName,
  talentName,
  talentEmail,
  initiatedBy,
  isDark = true,
}: StartChatModalProps) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    // If conversation already exists for this application, just open it
    const existing = listConversations().find(c => c.applicationId === applicationId)
    if (existing) {
      onClose()
      onSuccess(existing.id)
      return
    }

    if (!message.trim()) {
      setError('Please write a message to start the conversation.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const conv = openOrCreateConversation({
        applicationId,
        jobId,
        jobTitle,
        companyName,
        talentName,
        talentEmail,
        initiatedBy,
        initialMessage: message.trim(),
      })
      setMessage('')
      onClose()
      onSuccess(conv.id)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const surface  = isDark ? 'bg-[#1a1a1a] border-white/[0.09]' : 'bg-white border-gray-200'
  const textPri  = isDark ? 'text-white' : 'text-gray-900'
  const textSec  = isDark ? 'text-white/50' : 'text-gray-500'
  const divider  = isDark ? 'border-white/[0.07]' : 'border-gray-100'

  const otherParty = initiatedBy === 'employer' ? talentName : companyName

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-md rounded-[24px] border shadow-2xl ${surface} overflow-hidden`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider}`}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-white">
                  <IconMessageCircle size={18} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${textPri}`}>
                    Message {otherParty}
                  </div>
                  <div className={`text-xs ${textSec}`}>{jobTitle} · {companyName}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${isDark ? 'text-white/40 hover:text-white hover:bg-white/[0.06]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className={`text-xs leading-relaxed ${textSec}`}>
                Send a message request to <strong className={textPri}>{otherParty}</strong>.
                They'll see your message and can accept or decline your request.
              </p>

              <textarea
                id="start-chat-message"
                rows={4}
                value={message}
                onChange={e => { setMessage(e.target.value); setError(null) }}
                placeholder="Write your opening message…"
                className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors custom-scrollbar ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25 focus:border-[#FF6B00]/40'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FF6B00]/40'
                }`}
              />

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.25)] disabled:opacity-50 transition-opacity hover:opacity-90"
              >
                <IconSend size={15} />
                Send Message Request
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
