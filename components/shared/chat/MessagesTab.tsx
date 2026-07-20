'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconSend, IconMessage, IconCheck, IconX, IconInbox, IconMessageCircle } from '@tabler/icons-react'
import type { ChatConversation, ChatMessage, ChatParticipantRole } from '@/types/shared/chat'
import {
  listConversations,
  getMessages,
  acceptRequest,
  declineRequest,
  sendMessage,
  markConversationRead,
  subscribeChatChanges,
} from '@/lib/shared/chat/chat.service'
import { useDashboardTheme } from '@/components/shared/theme/DashboardThemeProvider'

// ────────────────────────────────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

interface Props {
  role: ChatParticipantRole
  /** Display name shown in the conversation header (e.g. "Salik Labs" for employer, "Alex Johnson" for talent) */
  myDisplayName: string
  /** Optional: open directly to this conversationId on mount */
  initialConversationId?: string | null
  isDark?: boolean
  variant?: 'full' | 'thread'
  onClose?: () => void
}

// ────────────────────────────────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────────────────────────────────

export default function MessagesTab({ role, myDisplayName, initialConversationId, isDark = true, variant = 'full', onClose }: Props) {
  let activeTheme: 'light' | 'dark' = 'light'
  try {
    const context = useDashboardTheme()
    activeTheme = context.theme
  } catch {
    activeTheme = isDark ? 'dark' : 'light'
  }
  const isDarkTheme = activeTheme === 'dark'

  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null)
  const [activeListTab, setActiveListTab] = useState<'chats' | 'requests'>('chats')
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedConversations, setHasLoadedConversations] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const selectedIdRef = useRef(selectedId)
  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const refreshAll = useCallback(async () => {
    try {
      const convs = await listConversations()
      setConversations(convs)
      const currentId = selectedIdRef.current
      if (currentId) {
        setMessages(await getMessages(currentId))
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setHasLoadedConversations(true)
    }
  }, [])

  // Initial load + subscription — mount-only, since refreshAll no longer
  // depends on selectedId (reads it via a ref instead), the realtime
  // channel is created once and isn't torn down/recreated on every click.
  useEffect(() => {
    refreshAll()
    return subscribeChatChanges(() => { refreshAll() })
  }, [refreshAll])

  useEffect(() => {
    if (initialConversationId) setSelectedId(initialConversationId)
  }, [initialConversationId])

  // Auto-select first conversation if none selected in the full inbox.
  useEffect(() => {
    if (variant === 'full' && !selectedId && conversations.length > 0) {
      const accepted = conversations.filter(c => c.requestState === 'accepted')
      if (accepted.length > 0) setSelectedId(accepted[0].id)
    }
  }, [conversations, selectedId, variant])

  // Mark read + load thread when a conversation is selected
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    ;(async () => {
      try {
        await markConversationRead(selectedId, role)
        const msgs = await getMessages(selectedId)
        if (!cancelled) setMessages(msgs)
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId, role])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null

  const acceptedConvs = conversations.filter(c => c.requestState === 'accepted')
  const requestConvs  = conversations.filter(c => {
    if (c.requestState !== 'pending') return false
    // Only show incoming requests in requests tab
    return c.initiatedBy !== role
  })
  const outgoingPending = conversations.filter(c => c.requestState === 'pending' && c.initiatedBy === role)
  const declinedConvs  = conversations.filter(c => c.requestState === 'declined')

  const handleSelectConv = (id: string) => {
    setSelectedId(id)
    setError(null)
  }

  const handleAccept = async (convId: string) => {
    setError(null)
    try {
      await acceptRequest(convId)
      await refreshAll()
      setSelectedId(convId)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDecline = async (convId: string) => {
    setError(null)
    try {
      await declineRequest(convId)
      await refreshAll()
      if (selectedId === convId) setSelectedId(null)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleSend = async () => {
    if (!selectedId || !inputValue.trim() || sending) return
    setSending(true)
    setError(null)
    try {
      await sendMessage({ conversationId: selectedId, senderRole: role, body: inputValue })
      setInputValue('')
      setMessages(await getMessages(selectedId))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Styling helpers ──────────────────────────────────────────────────────

  const surface    = isDarkTheme ? 'bg-[#171717] border-white/[0.07]' : 'bg-white/70 border-gray-200'
  const surface2   = isDarkTheme ? 'bg-[#141414] border-white/[0.065]' : 'bg-gray-50/70 border-gray-200'
  const textPri    = isDarkTheme ? 'text-white' : 'text-gray-900'
  const textSec    = isDarkTheme ? 'text-white/50' : 'text-gray-500'
  const textMuted  = isDarkTheme ? 'text-white/30' : 'text-gray-400'
  const divider    = isDarkTheme ? 'border-white/[0.07]' : 'border-gray-200'
  const hoverBg    = isDarkTheme ? 'hover:bg-white/[0.035]' : 'hover:bg-gray-50'
  const activeBg   = isDarkTheme ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-50 border-orange-200/70'
  const shadow     = isDarkTheme
    ? 'shadow-[12px_12px_30px_rgba(0,0,0,0.38),-6px_-6px_18px_rgba(255,255,255,0.025)]'
    : 'shadow-[12px_12px_30px_rgba(0,0,0,0.035),-6px_-6px_18px_rgba(255,255,255,0.5)]'

  // ─── Conversation list item ────────────────────────────────────────────────

  const renderConvItem = (conv: ChatConversation, showActions = false) => {
    const isSelected = selectedId === conv.id
    const unread     = role === 'talent' ? conv.unreadByTalent : conv.unreadByEmployer
    const otherName  = role === 'talent' ? conv.companyName : conv.talentName
    const preview    = conv.requestState === 'accepted'
      ? (messages.find(m => m.conversationId === conv.id) ? '' : conv.initialMessage)
      : conv.initialMessage
    return (
      <motion.div
        key={conv.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectConv(conv.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleSelectConv(conv.id)
          }
        }}
        whileHover={{ scale: 1.008 }}
        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/40 ${
          isSelected ? activeBg : `border-transparent ${hoverBg}`
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,107,0,0.2)]">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold truncate ${textPri}`}>{otherName}</span>
              <span className={`text-[10px] shrink-0 ${textMuted}`}>{fmtTime(conv.updatedAt)}</span>
            </div>
            <div className={`text-xs truncate mt-0.5 ${textSec}`}>{conv.jobTitle}</div>
            {conv.requestState !== 'accepted' && (
              <div className={`text-[10px] mt-1 truncate italic ${textMuted}`}>
                {conv.initialMessage}
              </div>
            )}
          </div>
          {unread > 0 && (
            <div className="shrink-0 h-5 w-5 rounded-full bg-[#FF6B00] flex items-center justify-center text-[10px] font-bold text-white">
              {unread}
            </div>
          )}
        </div>

        {/* Status tags */}
        <div className="mt-2 flex items-center gap-1.5">
          {conv.requestState === 'pending' && conv.initiatedBy === role && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isDarkTheme 
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              Awaiting reply
            </span>
          )}
          {conv.requestState === 'declined' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isDarkTheme 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-red-100 text-red-900 border-red-300'
            }`}>
              Declined
            </span>
          )}
        </div>

        {/* Accept / Decline actions for incoming requests */}
        {showActions && conv.requestState === 'pending' && conv.initiatedBy !== role && (
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleAccept(conv.id) }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#FF6B00]/10 text-[#FF914D] border border-[#FF6B00]/20 text-xs font-semibold hover:bg-[#FF6B00]/20 transition-colors cursor-pointer"
            >
              <IconCheck size={13} /> Accept
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDecline(conv.id) }}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${isDarkTheme ? 'border-white/10 text-white/40 hover:text-red-300 hover:border-red-500/20' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'}`}
            >
              <IconX size={13} /> Decline
            </button>
          </div>
        )}
      </motion.div>
    )
  }

  // ─── Thread view ──────────────────────────────────────────────────────────

  const renderThread = () => {
    if (!selectedConv) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6">
          <IconMessage size={40} className={textMuted} strokeWidth={1.3} />
          <p className={`text-sm ${textMuted}`}>
            {variant === 'thread' && !hasLoadedConversations ? 'Loading conversation…' : variant === 'thread' ? 'Conversation unavailable' : 'Select a conversation to view messages'}
          </p>
        </div>
      )
    }

    const convMessages = messages.filter(m => m.conversationId === selectedConv.id)
    const otherName = role === 'talent' ? selectedConv.companyName : selectedConv.talentName
    const canSend = selectedConv.requestState === 'accepted'
    const isIncomingRequest = selectedConv.requestState === 'pending' && selectedConv.initiatedBy !== role

    return (
      <div className="flex flex-col h-full">
        {/* Thread header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${divider} shrink-0`}>
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-sm font-semibold text-white shadow-[0_4px_12px_rgba(255,107,0,0.2)]">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-sm font-semibold ${textPri}`}>{otherName}</div>
            <div className={`text-[10px] ${textSec}`}>{selectedConv.jobTitle} · {selectedConv.companyName}</div>
          </div>
          {selectedConv.requestState === 'pending' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isDarkTheme 
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              Request pending
            </span>
          )}
          {selectedConv.requestState === 'declined' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isDarkTheme 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-red-100 text-red-900 border-red-300'
            }`}>
              Declined
            </span>
          )}
          {selectedConv.requestState === 'accepted' && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
              isDarkTheme 
                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                : 'bg-green-100 text-green-900 border-green-300'
            }`}>
              Active
            </span>
          )}
          {variant === 'thread' && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close conversation"
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors ${isDarkTheme ? 'border-white/10 text-white/45 hover:bg-white/[0.06] hover:text-white' : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              <IconX size={17} />
            </button>
          )}
        </div>

        {/* Incoming request banner */}
        {isIncomingRequest && (
          <div className={`px-5 py-3 border-b ${divider} shrink-0 ${isDarkTheme ? 'bg-orange-500/5' : 'bg-orange-50/50'}`}>
            <p className={`text-xs mb-2 ${textSec}`}>
              <strong className="text-[#FF914D]">{otherName}</strong> wants to start a conversation about <strong className={textPri}>{selectedConv.jobTitle}</strong>
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleAccept(selectedConv.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FF6B00]/10 text-[#FF914D] border border-[#FF6B00]/20 text-xs font-semibold hover:bg-[#FF6B00]/20 transition-colors">
                <IconCheck size={13} /> Accept Request
              </button>
              <button onClick={() => handleDecline(selectedConv.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${isDarkTheme ? 'border-white/10 text-white/40 hover:text-red-300 hover:border-red-500/20' : 'border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200'}`}>
                <IconX size={13} /> Decline
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          {/* Always show the initial message as the first bubble */}
          <div className={`flex ${selectedConv.initiatedBy === role ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[72%] ${selectedConv.initiatedBy === role ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                selectedConv.initiatedBy === role
                  ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-white rounded-br-sm'
                  : isDarkTheme
                    ? 'bg-[#2b2b2b] border border-white/[0.08] text-white/90 rounded-bl-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}>
                {selectedConv.initialMessage}
              </div>
              <div className={`text-[10px] px-1 ${textMuted}`}>{fmtFull(selectedConv.createdAt)}</div>
            </div>
          </div>

          {/* Subsequent messages (accepted threads only) */}
          {convMessages.slice(1).map(msg => {
            const isMine = msg.senderRole === role
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF914D] text-white rounded-br-sm'
                      : isDarkTheme
                        ? 'bg-[#2b2b2b] border border-white/[0.08] text-white/90 rounded-bl-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    {msg.body}
                  </div>
                  <div className={`text-[10px] px-1 ${textMuted}`}>{fmtFull(msg.sentAt)}</div>
                </div>
              </div>
            )
          })}

          {/* Declined state note */}
          {selectedConv.requestState === 'declined' && (
            <div className="text-center py-4">
              <span className={`text-xs px-3 py-1.5 rounded-full border ${isDarkTheme ? 'border-white/10 text-white/30' : 'border-gray-200 text-gray-400'}`}>
                {selectedConv.initiatedBy === role ? 'Your request was declined.' : 'You declined this request.'}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={`shrink-0 px-5 py-3 border-t ${divider}`}>
          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
          {!canSend ? (
            <p className={`text-xs text-center py-2 ${textMuted}`}>
              {selectedConv.requestState === 'pending'
                ? selectedConv.initiatedBy === role
                  ? 'Waiting for the other party to accept your request…'
                  : 'Accept the request above to start messaging.'
                : 'This conversation is closed.'}
            </p>
          ) : (
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                id="chat-input"
                rows={1}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                className={`flex-1 resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors custom-scrollbar ${
                  isDarkTheme
                    ? 'bg-white/[0.04] border-white/10 text-white placeholder-white/25 focus:border-[#FF6B00]/40'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FF6B00]/40'
                }`}
                style={{ maxHeight: '96px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || sending}
                aria-label="Send message"
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF914D] flex items-center justify-center text-white shadow-[0_6px_16px_rgba(255,107,0,0.28)] disabled:opacity-40 transition-opacity hover:opacity-90"
              >
                <IconSend size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const requestBadge = requestConvs.length + outgoingPending.filter(c => c.requestState === 'pending').length

  if (variant === 'thread') {
    return (
      <section className={`flex h-full flex-col overflow-hidden ${surface}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId ?? 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex h-full flex-col"
          >
            {renderThread()}
          </motion.div>
        </AnimatePresence>
      </section>
    )
  }

  return (
    <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-9 lg:gap-7">

      {/* Left: Conversation List */}
      <section className={`flex flex-col overflow-hidden rounded-[24px] border ${surface} ${shadow} lg:col-span-4`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${divider} shrink-0`}>
          <p className="text-xs uppercase tracking-[0.18em] text-[#FF6B00] mb-0.5">Messages</p>
          <h1 className={`text-xl font-semibold ${textPri}`}>Inbox</h1>
        </div>

        {/* Tabs: Chats / Requests */}
        <div className={`flex border-b ${divider} px-4 shrink-0`}>
          {(['chats', 'requests'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveListTab(tab)}
              className={`relative flex items-center gap-2 px-3 py-3 text-xs font-semibold capitalize transition-colors ${
                activeListTab === tab
                  ? 'text-[#FF914D]'
                  : textMuted + ' hover:' + (isDarkTheme ? 'text-white' : 'text-gray-700')
              }`}
            >
              {tab === 'chats' ? 'Chats' : 'Requests'}
              {tab === 'requests' && requestConvs.length > 0 && (
                <span className="h-4 w-4 rounded-full bg-[#FF6B00] text-[9px] font-bold text-white flex items-center justify-center">
                  {requestConvs.length}
                </span>
              )}
              {activeListTab === tab && (
                <motion.div layoutId="msg-tab-indicator" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF6B00]" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {activeListTab === 'chats' ? (
            <>
              {[...acceptedConvs, ...declinedConvs, ...outgoingPending].map(c => renderConvItem(c))}
              {acceptedConvs.length === 0 && outgoingPending.length === 0 && declinedConvs.length === 0 && (
                <div className={`flex flex-col items-center justify-center gap-2 pt-16 text-center ${textMuted}`}>
                  <IconInbox size={32} strokeWidth={1.3} />
                  <p className="text-xs">No active conversations yet.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {requestConvs.map(c => renderConvItem(c, true))}
              {requestConvs.length === 0 && (
                <div className={`flex flex-col items-center justify-center gap-2 pt-16 text-center ${textMuted}`}>
                  <IconMessageCircle size={32} strokeWidth={1.3} />
                  <p className="text-xs">No pending requests.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Right: Thread */}
      <section className={`flex flex-col overflow-hidden rounded-[24px] border ${surface} ${shadow} lg:col-span-5`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedId ?? 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            {renderThread()}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  )
}
