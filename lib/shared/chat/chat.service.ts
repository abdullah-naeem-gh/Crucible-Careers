// ──────────────────────────────────────────────────────
//  Local Chat Service  (localStorage-backed)
// ──────────────────────────────────────────────────────
import type {
  ChatConversation,
  ChatMessage,
  ChatParticipantRole,
  ChatRequestState,
} from '@/types/shared/chat'

const CONV_KEY = 'crucible_chat_conversations'
const MSG_KEY  = 'crucible_chat_messages'
const CHANGE_EVENT = 'crucible_chat_changed'

// ── helpers ─────────────────────────────────────────────

function uuid(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const SAMPLE_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'sample_conv_1',
    applicationId: '1',
    jobId: 'job_sf_1',
    jobTitle: 'Senior Frontend Engineer',
    companyName: 'Salik Labs',
    talentName: 'Alex Johnson',
    talentEmail: 'alex.johnson@example.com',
    initiatedBy: 'employer',
    requestState: 'accepted',
    initialMessage: 'Hi Alex, we reviewed your application for the Senior Frontend Engineer position and are very impressed with your profile. Do you have some time for a quick call this week?',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    unreadByTalent: 0,
    unreadByEmployer: 0,
  },
  {
    id: 'sample_conv_2',
    applicationId: '2',
    jobId: 'job_ml_1',
    jobTitle: 'Machine Learning Engineer',
    companyName: 'Vyro',
    talentName: 'Alex Johnson',
    talentEmail: 'alex.johnson@example.com',
    initiatedBy: 'talent',
    requestState: 'pending',
    initialMessage: 'Hello, I am very excited about the Machine Learning Engineer role at Vyro! I wanted to follow up on my application and share some of my recent project proofs.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    unreadByTalent: 0,
    unreadByEmployer: 1,
  },
  {
    id: 'sample_conv_3',
    applicationId: 'recruiter_app_3',
    jobId: '1',
    jobTitle: 'AI Engineer',
    companyName: 'Vyro',
    talentName: 'Sarah Connor',
    talentEmail: 'sarah.connor@example.com',
    initiatedBy: 'employer',
    requestState: 'accepted',
    initialMessage: 'Hello Sarah, we would love to set up a chat to discuss the AI Engineer position.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    unreadByTalent: 1,
    unreadByEmployer: 0,
  }
]

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1_1',
    conversationId: 'sample_conv_1',
    senderRole: 'employer',
    body: 'Hi Alex, we reviewed your application for the Senior Frontend Engineer position and are very impressed with your profile. Do you have some time for a quick call this week?',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readByRecipient: true,
  },
  {
    id: 'msg_1_2',
    conversationId: 'sample_conv_1',
    senderRole: 'talent',
    body: "Hi! Thank you for reaching out. Yes, I am definitely interested and available. I'm free on Wednesday and Thursday afternoon.",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    readByRecipient: true,
  },
  {
    id: 'msg_1_3',
    conversationId: 'sample_conv_1',
    senderRole: 'employer',
    body: "Great! Let's schedule it for Wednesday at 3 PM. I will send over a calendar invite.",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    readByRecipient: true,
  },
  {
    id: 'msg_2_1',
    conversationId: 'sample_conv_2',
    senderRole: 'talent',
    body: 'Hello, I am very excited about the Machine Learning Engineer role at Vyro! I wanted to follow up on my application and share some of my recent project proofs.',
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    readByRecipient: false,
  },
  {
    id: 'msg_3_1',
    conversationId: 'sample_conv_3',
    senderRole: 'employer',
    body: 'Hello Sarah, we would love to set up a chat to discuss the AI Engineer position.',
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    readByRecipient: true,
  },
  {
    id: 'msg_3_2',
    conversationId: 'sample_conv_3',
    senderRole: 'talent',
    body: 'Sounds exciting! I would be happy to discuss details. What format will the technical session be?',
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readByRecipient: true,
  },
  {
    id: 'msg_3_3',
    conversationId: 'sample_conv_3',
    senderRole: 'employer',
    body: "We will start with a 45-minute architectural discussion, followed by some collaborative coding.",
    sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    readByRecipient: false,
  }
]

function readConversations(): ChatConversation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CONV_KEY)
    if (!raw) {
      localStorage.setItem(CONV_KEY, JSON.stringify(SAMPLE_CONVERSATIONS))
      if (!localStorage.getItem(MSG_KEY)) {
        localStorage.setItem(MSG_KEY, JSON.stringify(SAMPLE_MESSAGES))
      }
      return SAMPLE_CONVERSATIONS
    }
    return JSON.parse(raw) as ChatConversation[]
  } catch {
    return []
  }
}

function writeConversations(convs: ChatConversation[]): void {
  localStorage.setItem(CONV_KEY, JSON.stringify(convs))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

function readMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(MSG_KEY)
    if (!raw) {
      localStorage.setItem(MSG_KEY, JSON.stringify(SAMPLE_MESSAGES))
      return SAMPLE_MESSAGES
    }
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

function writeMessages(msgs: ChatMessage[]): void {
  localStorage.setItem(MSG_KEY, JSON.stringify(msgs))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

// ── public API ─────────────────────────────────────────

/** List all conversations (both roles see the same list). */
export function listConversations(): ChatConversation[] {
  return readConversations().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

/** Get a single conversation by id. */
export function getConversation(id: string): ChatConversation | null {
  return readConversations().find(c => c.id === id) ?? null
}

/**
 * Open or create a conversation for an application.
 * If one already exists, returns the existing conversation (idempotent).
 * Throws if initial message is empty when creating.
 */
export function openOrCreateConversation(params: {
  applicationId: string
  jobId: string
  jobTitle: string
  companyName: string
  talentName: string
  talentEmail: string
  initiatedBy: ChatParticipantRole
  initialMessage: string
}): ChatConversation {
  const existing = readConversations().find(
    c => c.applicationId === params.applicationId
  )
  if (existing) return existing

  if (!params.initialMessage.trim()) {
    throw new Error('An initial message is required to start a conversation.')
  }

  const now = new Date().toISOString()
  const conv: ChatConversation = {
    id: uuid(),
    applicationId: params.applicationId,
    jobId: params.jobId,
    jobTitle: params.jobTitle,
    companyName: params.companyName,
    talentName: params.talentName,
    talentEmail: params.talentEmail,
    initiatedBy: params.initiatedBy,
    requestState: 'pending',
    initialMessage: params.initialMessage.trim(),
    createdAt: now,
    updatedAt: now,
    unreadByTalent: params.initiatedBy === 'employer' ? 1 : 0,
    unreadByEmployer: params.initiatedBy === 'talent' ? 1 : 0,
  }

  const convs = readConversations()
  convs.unshift(conv)
  writeConversations(convs)

  // Persist the initial message
  const msg: ChatMessage = {
    id: uuid(),
    conversationId: conv.id,
    senderRole: params.initiatedBy,
    body: params.initialMessage.trim(),
    sentAt: now,
    readByRecipient: false,
  }
  const msgs = readMessages()
  msgs.push(msg)
  writeMessages(msgs)

  return conv
}

/** Accept a pending request. */
export function acceptRequest(conversationId: string): void {
  const convs = readConversations()
  const idx = convs.findIndex(c => c.id === conversationId)
  if (idx === -1) return
  convs[idx] = {
    ...convs[idx],
    requestState: 'accepted',
    updatedAt: new Date().toISOString(),
  }
  writeConversations(convs)
}

/** Decline a pending request. */
export function declineRequest(conversationId: string): void {
  const convs = readConversations()
  const idx = convs.findIndex(c => c.id === conversationId)
  if (idx === -1) return
  convs[idx] = {
    ...convs[idx],
    requestState: 'declined',
    updatedAt: new Date().toISOString(),
  }
  writeConversations(convs)
}

/**
 * Send a message.
 * Blocked if conversation is pending or declined.
 */
export function sendMessage(params: {
  conversationId: string
  senderRole: ChatParticipantRole
  body: string
}): ChatMessage {
  const { conversationId, senderRole, body } = params
  if (!body.trim()) throw new Error('Message body cannot be empty.')

  const convs = readConversations()
  const convIdx = convs.findIndex(c => c.id === conversationId)
  if (convIdx === -1) throw new Error('Conversation not found.')

  const conv = convs[convIdx]
  if (conv.requestState !== 'accepted') {
    throw new Error('Cannot send messages in a pending or declined conversation.')
  }

  const now = new Date().toISOString()
  const msg: ChatMessage = {
    id: uuid(),
    conversationId,
    senderRole,
    body: body.trim(),
    sentAt: now,
    readByRecipient: false,
  }

  const msgs = readMessages()
  msgs.push(msg)
  writeMessages(msgs)

  // Update conversation unread counts + updatedAt
  convs[convIdx] = {
    ...conv,
    updatedAt: now,
    unreadByTalent: senderRole === 'employer'
      ? conv.unreadByTalent + 1
      : conv.unreadByTalent,
    unreadByEmployer: senderRole === 'talent'
      ? conv.unreadByEmployer + 1
      : conv.unreadByEmployer,
  }
  writeConversations(convs)

  return msg
}

/** Get all messages for a conversation, oldest first. */
export function getMessages(conversationId: string): ChatMessage[] {
  return readMessages()
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
}

/**
 * Mark all messages in a conversation as read for the given role.
 * Resets the corresponding unread counter on the conversation.
 */
export function markConversationRead(conversationId: string, role: ChatParticipantRole): void {
  const msgs = readMessages().map(m => {
    if (m.conversationId !== conversationId) return m
    if (m.senderRole === role) return m           // own messages
    return { ...m, readByRecipient: true }
  })
  writeMessages(msgs)

  const convs = readConversations()
  const idx = convs.findIndex(c => c.id === conversationId)
  if (idx === -1) return
  convs[idx] = {
    ...convs[idx],
    unreadByTalent: role === 'talent' ? 0 : convs[idx].unreadByTalent,
    unreadByEmployer: role === 'employer' ? 0 : convs[idx].unreadByEmployer,
  }
  writeConversations(convs)
}

/**
 * Total unread count for a role — messages + pending requests (for recipient).
 */
export function getTotalUnread(role: ChatParticipantRole): number {
  const convs = readConversations()
  const msgUnread = convs.reduce((acc, c) => {
    return acc + (role === 'talent' ? c.unreadByTalent : c.unreadByEmployer)
  }, 0)
  // Pending requests initiated by the other role are also "unread" for this role
  const pendingRequests = convs.filter(
    c => c.requestState === 'pending' && c.initiatedBy !== role
  ).length
  return msgUnread + pendingRequests
}

/** Subscribe to storage changes emitted from other tabs + local mutations. */
export function subscribeChatChanges(handler: () => void): () => void {
  const localHandler = () => handler()
  const storageHandler = (e: StorageEvent) => {
    if (e.key === CONV_KEY || e.key === MSG_KEY) handler()
  }
  window.addEventListener(CHANGE_EVENT as any, localHandler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(CHANGE_EVENT as any, localHandler)
    window.removeEventListener('storage', storageHandler)
  }
}
