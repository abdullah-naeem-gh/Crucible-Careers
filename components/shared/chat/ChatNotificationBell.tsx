'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconBell, IconMessage, IconMessageCircle } from '@tabler/icons-react'
import type { ChatParticipantRole, ChatConversation } from '@/types/shared/chat'
import {
  listConversations,
  getTotalUnread,
  markConversationRead,
  subscribeChatChanges,
} from '@/lib/shared/chat/chat.service'
import { useDashboardTheme } from '@/components/shared/theme/DashboardThemeProvider'

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

interface ChatNotificationBellProps {
  role: ChatParticipantRole
  isDark?: boolean
  /** Called when a notification item is clicked — navigate to messages tab */
  onOpenMessages: (conversationId?: string) => void
}

export default function ChatNotificationBell({ role, isDark = true, onOpenMessages }: ChatNotificationBellProps) {
  let activeTheme: 'light' | 'dark' = 'light'
  try {
    const context = useDashboardTheme()
    activeTheme = context.theme
  } catch {
    activeTheme = isDark ? 'dark' : 'light'
  }
  const isDarkTheme = activeTheme === 'dark'

  const [open, setOpen] = useState(false)
  const [totalUnread, setTotalUnread] = useState(0)
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const popupRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(() => {
    setTotalUnread(getTotalUnread(role))
    setConversations(listConversations())
  }, [role])

  useEffect(() => {
    refresh()
    return subscribeChatChanges(refresh)
  }, [refresh])

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleItemClick = (convId: string) => {
    markConversationRead(convId, role)
    setOpen(false)
    onOpenMessages(convId)
  }

  // Pending incoming requests
  const pendingRequests = conversations.filter(c => c.requestState === 'pending' && c.initiatedBy !== role)
  // Accepted convs with unread messages
  const unreadConvs = conversations.filter(c => {
    const u = role === 'talent' ? c.unreadByTalent : c.unreadByEmployer
    return c.requestState === 'accepted' && u > 0
  })

  const surfaceBg   = isDarkTheme ? 'bg-[#1a1a1a] border-white/[0.09]' : 'bg-white border-gray-200/80'
  const textPri     = isDarkTheme ? 'text-white' : 'text-gray-900'
  const textSec     = isDarkTheme ? 'text-white/50' : 'text-gray-500'
  const textMuted   = isDarkTheme ? 'text-white/30' : 'text-gray-400'
  const hoverBg     = isDarkTheme ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
  const divider     = isDarkTheme ? 'border-white/[0.07]' : 'border-gray-100'

  return (
    <div className="relative" ref={popupRef}>
      {/* Bell button */}
      <button
        id="chat-notification-bell"
        onClick={() => setOpen(v => !v)}
        aria-label={`Messages${totalUnread > 0 ? `, ${totalUnread} unread` : ''}`}
        className={`relative grid h-8 w-8 place-items-center rounded-full transition-colors ${
          isDarkTheme
            ? 'text-white/45 hover:text-white hover:bg-white/[0.06]'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
        }`}
      >
        <IconBell size={18} strokeWidth={1.7} />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#FF6B00] flex items-center justify-center text-[9px] font-bold text-white shadow-[0_2px_8px_rgba(255,107,0,0.45)]">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute right-0 top-11 z-50 w-80 rounded-2xl border shadow-2xl ${surfaceBg} overflow-hidden`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
              <span className={`text-sm font-semibold ${textPri}`}>Notifications</span>
              {totalUnread > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6B00]/10 text-[#FF914D] border border-[#FF6B00]/20 font-semibold">
                  {totalUnread} new
                </span>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {/* Pending requests */}
              {pendingRequests.length > 0 && (
                <>
                  <div className={`px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                    Message Requests
                  </div>
                  {pendingRequests.map(conv => {
                    const otherName = role === 'talent' ? conv.companyName : conv.talentName
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleItemClick(conv.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${hoverBg}`}
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-sm font-semibold text-white">
                          {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-semibold ${textPri} flex items-center gap-1.5`}>
                            <IconMessageCircle size={11} className="text-[#FF914D]" />
                            {otherName}
                          </div>
                          <div className={`text-[11px] ${textSec} truncate mt-0.5`}>
                            Wants to chat about {conv.jobTitle}
                          </div>
                          <div className={`text-[10px] ${textMuted} mt-0.5`}>{fmtTime(conv.createdAt)}</div>
                        </div>
                      </button>
                    )
                  })}
                </>
              )}

              {/* Unread messages */}
              {unreadConvs.length > 0 && (
                <>
                  <div className={`px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
                    Unread Messages
                  </div>
                  {unreadConvs.map(conv => {
                    const otherName = role === 'talent' ? conv.companyName : conv.talentName
                    const unreadCount = role === 'talent' ? conv.unreadByTalent : conv.unreadByEmployer
                    return (
                      <button
                        key={conv.id}
                        onClick={() => handleItemClick(conv.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-colors ${hoverBg}`}
                      >
                        <div className="relative">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-sm font-semibold text-white">
                            {otherName.charAt(0).toUpperCase()}
                          </div>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#FF6B00] flex items-center justify-center text-[9px] font-bold text-white">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-semibold ${textPri} flex items-center gap-1.5`}>
                            <IconMessage size={11} className="text-[#FF914D]" />
                            {otherName}
                          </div>
                          <div className={`text-[11px] ${textSec} truncate mt-0.5`}>{conv.jobTitle}</div>
                          <div className={`text-[10px] ${textMuted} mt-0.5`}>{fmtTime(conv.updatedAt)}</div>
                        </div>
                      </button>
                    )
                  })}
                </>
              )}

              {/* Empty state */}
              {pendingRequests.length === 0 && unreadConvs.length === 0 && (
                <div className={`flex flex-col items-center justify-center gap-2 py-10 ${textMuted}`}>
                  <IconBell size={28} strokeWidth={1.3} />
                  <p className="text-xs">You're all caught up</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`border-t ${divider} px-4 py-2.5`}>
              <button
                onClick={() => { setOpen(false); onOpenMessages() }}
                className="w-full text-center text-xs text-[#FF914D] font-semibold hover:text-[#FF6B00] transition-colors"
              >
                View all messages →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
