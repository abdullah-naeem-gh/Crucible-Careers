// ──────────────────────────────────────────────────────
//  Chat Service (Supabase-backed, realtime via postgres_changes)
// ──────────────────────────────────────────────────────
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'
import type {
  ChatConversation,
  ChatMessage,
  ChatParticipantRole,
} from '@/types/shared/chat'

type SupabaseClient = ReturnType<typeof createBrowserSupabaseClient>

const CONVERSATION_SELECT = '*, applications(job_id, profile_snapshot, jobs(title))'

async function mapConversations(supabase: SupabaseClient, rows: any[]): Promise<ChatConversation[]> {
  if (rows.length === 0) return []

  const employerIds = Array.from(new Set(rows.map((r) => r.employer_id)))
  const { data: companies } = await supabase
    .from('employer_company_names')
    .select('id, company')
    .in('id', employerIds)
  const companyById = new Map((companies ?? []).map((c) => [c.id, c.company]))

  const convIds = rows.map((r) => r.id)
  const { data: unreadMsgs } = await supabase
    .from('messages')
    .select('conversation_id, sender_role')
    .in('conversation_id', convIds)
    .eq('read_by_recipient', false)

  const unreadByConv = new Map<string, { talent: number; employer: number }>()
  for (const m of unreadMsgs ?? []) {
    const entry = unreadByConv.get(m.conversation_id) ?? { talent: 0, employer: 0 }
    if (m.sender_role === 'employer') entry.talent += 1
    else entry.employer += 1
    unreadByConv.set(m.conversation_id, entry)
  }

  return rows.map((row) => {
    const snap = row.applications?.profile_snapshot ?? {}
    const unread = unreadByConv.get(row.id) ?? { talent: 0, employer: 0 }
    return {
      id: row.id,
      applicationId: row.application_id,
      jobId: row.applications?.job_id ?? '',
      jobTitle: row.applications?.jobs?.title ?? '',
      companyName: companyById.get(row.employer_id) ?? '',
      talentName: snap.name || '',
      talentEmail: snap.email || '',
      initiatedBy: row.initiated_by,
      requestState: row.request_state,
      initialMessage: row.initial_message,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      unreadByTalent: unread.talent,
      unreadByEmployer: unread.employer,
    }
  })
}

/** List all conversations the current user participates in. */
export async function listConversations(): Promise<ChatConversation[]> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Failed to list conversations', error)
    return []
  }
  return mapConversations(supabase, data ?? [])
}

/** Get a single conversation by id. */
export async function getConversation(id: string): Promise<ChatConversation | null> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  const [conv] = await mapConversations(supabase, [data])
  return conv ?? null
}

/** Get the conversation associated with an application, if one exists. */
export async function getConversationForApplication(applicationId: string): Promise<ChatConversation | null> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('application_id', applicationId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const [conv] = await mapConversations(supabase, [data])
  return conv ?? null
}

/**
 * Open or create a conversation for an application.
 * If one already exists, returns the existing conversation (idempotent).
 * Throws if initial message is empty when creating.
 */
export async function openOrCreateConversation(params: {
  applicationId: string
  jobId: string
  jobTitle: string
  companyName: string
  talentName: string
  talentEmail: string
  initiatedBy: ChatParticipantRole
  initialMessage: string
}): Promise<ChatConversation> {
  const supabase = createBrowserSupabaseClient()

  const { data: existing } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('application_id', params.applicationId)
    .maybeSingle()

  if (existing) {
    const [conv] = await mapConversations(supabase, [existing])
    return conv
  }

  if (!params.initialMessage.trim()) {
    throw new Error('An initial message is required to start a conversation.')
  }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('talent_id, job_id, jobs(employer_id)')
    .eq('id', params.applicationId)
    .single()

  if (appError || !application) {
    throw new Error('Could not find the application for this conversation.')
  }

  const talentId = (application as any).talent_id
  const employerId = (application as any).jobs?.employer_id
  if (!employerId) {
    throw new Error('Could not resolve the employer for this conversation.')
  }

  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({
      application_id: params.applicationId,
      talent_id: talentId,
      employer_id: employerId,
      initiated_by: params.initiatedBy,
      initial_message: params.initialMessage.trim(),
    })
    .select(CONVERSATION_SELECT)
    .single()

  if (insertError || !created) {
    if (insertError?.code === '23505') {
      const { data: raced } = await supabase
        .from('conversations')
        .select(CONVERSATION_SELECT)
        .eq('application_id', params.applicationId)
        .single()
      if (raced) {
        const [conv] = await mapConversations(supabase, [raced])
        return conv
      }
    }
    throw new Error(insertError?.message || 'Failed to create conversation.')
  }

  await supabase.from('messages').insert({
    conversation_id: created.id,
    sender_role: params.initiatedBy,
    body: params.initialMessage.trim(),
  })

  const [conv] = await mapConversations(supabase, [created])
  return conv
}

/** Accept a pending request. */
export async function acceptRequest(conversationId: string): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  await supabase.from('conversations').update({ request_state: 'accepted' }).eq('id', conversationId)
}

/** Decline a pending request. */
export async function declineRequest(conversationId: string): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  await supabase.from('conversations').update({ request_state: 'declined' }).eq('id', conversationId)
}

/**
 * Send a message.
 * Blocked if conversation is pending or declined.
 */
export async function sendMessage(params: {
  conversationId: string
  senderRole: ChatParticipantRole
  body: string
}): Promise<ChatMessage> {
  const { conversationId, senderRole, body } = params
  if (!body.trim()) throw new Error('Message body cannot be empty.')

  const supabase = createBrowserSupabaseClient()
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('request_state')
    .eq('id', conversationId)
    .maybeSingle()

  if (convError || !conv) throw new Error('Conversation not found.')
  if (conv.request_state !== 'accepted') {
    throw new Error('Cannot send messages in a pending or declined conversation.')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_role: senderRole, body: body.trim() })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to send message.')

  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderRole: data.sender_role,
    body: data.body,
    sentAt: data.sent_at,
    readByRecipient: data.read_by_recipient,
  }
}

/** Get all messages for a conversation, oldest first. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = createBrowserSupabaseClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })

  if (error || !data) return []

  return data.map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    senderRole: m.sender_role,
    body: m.body,
    sentAt: m.sent_at,
    readByRecipient: m.read_by_recipient,
  }))
}

/**
 * Mark all messages in a conversation as read for the given role
 * (i.e. mark the other participant's messages as read).
 */
export async function markConversationRead(conversationId: string, role: ChatParticipantRole): Promise<void> {
  const supabase = createBrowserSupabaseClient()
  await supabase
    .from('messages')
    .update({ read_by_recipient: true })
    .eq('conversation_id', conversationId)
    .neq('sender_role', role)
}

/**
 * Total unread count for a role — messages + pending requests (for recipient).
 */
export async function getTotalUnread(role: ChatParticipantRole): Promise<number> {
  const convs = await listConversations()
  const msgUnread = convs.reduce((acc, c) => acc + (role === 'talent' ? c.unreadByTalent : c.unreadByEmployer), 0)
  const pendingRequests = convs.filter((c) => c.requestState === 'pending' && c.initiatedBy !== role).length
  return msgUnread + pendingRequests
}

/** Subscribe to realtime changes on conversations/messages via Supabase Realtime. */
export function subscribeChatChanges(handler: () => void): () => void {
  const supabase = createBrowserSupabaseClient()
  // Each caller needs its own channel — a shared topic name would make
  // concurrent subscribers (sidebar, bell, MessagesTab) fight over the same
  // cached channel instance and throw once one of them has already subscribed.
  const channel = supabase
    .channel(`chat-changes-${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, handler)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
