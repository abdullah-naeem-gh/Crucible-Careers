// ──────────────────────────────────────────────────────
//  Shared Chat Types
// ──────────────────────────────────────────────────────

export type ChatParticipantRole = 'talent' | 'employer'

export type ChatRequestState = 'pending' | 'accepted' | 'declined'

export interface ChatConversation {
  /** Unique conversation id, one per applicationId */
  id: string
  applicationId: string
  jobId: string
  jobTitle: string
  companyName: string
  companyLogoUrl: string | null
  companyVerified: boolean
  recruiterId: string | null
  recruiterName: string
  recruiterAvatarUrl: string | null
  talentName: string
  talentEmail: string
  /** role that sent the initial request */
  initiatedBy: ChatParticipantRole
  requestState: ChatRequestState
  /** initial message body, set when conversation is created */
  initialMessage: string
  createdAt: string
  updatedAt: string
  unreadByTalent: number
  unreadByEmployer: number
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderRole: ChatParticipantRole
  senderUserId: string | null
  senderName: string
  senderAvatarUrl: string | null
  senderCompanyName: string
  senderCompanyLogoUrl: string | null
  senderCompanyVerified: boolean
  body: string
  sentAt: string
  readByRecipient: boolean
}

export interface ChatNotification {
  conversationId: string
  type: 'request' | 'message'
  preview: string
  fromName: string
  fromRole: ChatParticipantRole
  timestamp: string
  unread: number
}
