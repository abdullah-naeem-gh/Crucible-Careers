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

async function getSenderSnapshot(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in.')
  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', user.id).maybeSingle(),
    supabase.from('company_memberships')
      .select('companies(name, verification_status, company_profiles(logo_url))')
      .eq('user_id', user.id).eq('status', 'active').maybeSingle(),
  ])
  const company: any = membership?.companies
  const companyProfile = Array.isArray(company?.company_profiles) ? company.company_profiles[0] : company?.company_profiles
  return {
    sender_user_id: user.id,
    sender_display_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email || 'Crucible user',
    sender_avatar_url: profile?.avatar_url ?? null,
    sender_company_name: company?.name ?? null,
    sender_company_logo_url: companyProfile?.logo_url ?? null,
    sender_company_verified: company?.verification_status === 'verified',
  }
}

async function mapConversations(supabase: SupabaseClient, rows: any[]): Promise<ChatConversation[]> {
  if (rows.length === 0) return []

  const employerIds = Array.from(new Set(rows.map((r) => r.company_id || r.employer_id).filter(Boolean)))
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, verification_status, company_profiles(logo_url)')
    .in('id', employerIds)
  const companyById = new Map((companies ?? []).map((c: any) => [c.id, c]))

  const recruiterIds = Array.from(new Set(rows.map((r) => r.assigned_to_user_id).filter(Boolean)))
  const { data: recruiterProfiles } = recruiterIds.length
    ? await supabase.from('employer_public_identities').select('id, first_name, last_name, avatar_url').in('id', recruiterIds)
    : { data: [] }
  const recruiterById = new Map((recruiterProfiles ?? []).map((p: any) => [p.id, p]))

  const convIds = rows.map((r) => r.id)
  const { data: unreadMsgs } = await supabase
    .from('messages')
    .select('conversation_id, sender_role, sender_user_id, sent_at')
    .in('conversation_id', convIds)

  const { data: { user } } = await supabase.auth.getUser()
  const { data: readStates } = user
    ? await supabase.from('conversation_read_states').select('conversation_id, last_read_at').eq('user_id', user.id).in('conversation_id', convIds)
    : { data: [] }
  const readAtByConv = new Map((readStates ?? []).map((state: any) => [state.conversation_id, state.last_read_at]))

  const unreadByConv = new Map<string, { talent: number; employer: number }>()
  for (const m of unreadMsgs ?? []) {
    if (m.sender_user_id === user?.id) continue
    const readAt = readAtByConv.get(m.conversation_id)
    if (readAt && new Date(m.sent_at) <= new Date(readAt)) continue
    const entry = unreadByConv.get(m.conversation_id) ?? { talent: 0, employer: 0 }
    if (m.sender_role === 'employer') entry.talent += 1
    else entry.employer += 1
    unreadByConv.set(m.conversation_id, entry)
  }

  return rows.map((row) => {
    const snap = row.applications?.profile_snapshot ?? {}
    const unread = unreadByConv.get(row.id) ?? { talent: 0, employer: 0 }
    const company = companyById.get(row.company_id || row.employer_id) as any
    const recruiter = recruiterById.get(row.assigned_to_user_id) as any
    const companyProfile = Array.isArray(company?.company_profiles) ? company.company_profiles[0] : company?.company_profiles
    return {
      id: row.id,
      applicationId: row.application_id,
      jobId: row.applications?.job_id ?? '',
      jobTitle: row.applications?.jobs?.title ?? '',
      companyName: company?.name ?? '',
      companyLogoUrl: companyProfile?.logo_url ?? null,
      companyVerified: company?.verification_status === 'verified',
      recruiterId: row.assigned_to_user_id ?? null,
      recruiterName: recruiter ? [recruiter.first_name, recruiter.last_name].filter(Boolean).join(' ') : 'Recruiting team',
      recruiterAvatarUrl: recruiter?.avatar_url ?? null,
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
    .select('talent_id, job_id, jobs(company_id, assigned_to_user_id, created_by_user_id)')
    .eq('id', params.applicationId)
    .single()

  if (appError || !application) {
    throw new Error('Could not find the application for this conversation.')
  }

  const talentId = (application as any).talent_id
  const employerId = (application as any).jobs?.company_id
  if (!employerId) {
    throw new Error('Could not resolve the employer for this conversation.')
  }

  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({
      application_id: params.applicationId,
      talent_id: talentId,
      company_id: employerId,
      assigned_to_user_id: (application as any).jobs?.assigned_to_user_id || (application as any).jobs?.created_by_user_id,
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

  const initialSender = await getSenderSnapshot(supabase)
  await supabase.from('messages').insert({
    conversation_id: created.id,
    sender_role: params.initiatedBy,
    body: params.initialMessage.trim(),
    ...initialSender,
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
    .insert({ conversation_id: conversationId, sender_role: senderRole, body: body.trim(), ...(await getSenderSnapshot(supabase)) })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message || 'Failed to send message.')

  return {
    id: data.id,
    conversationId: data.conversation_id,
    senderRole: data.sender_role,
    senderUserId: data.sender_user_id,
    senderName: data.sender_display_name || '',
    senderAvatarUrl: data.sender_avatar_url,
    senderCompanyName: data.sender_company_name || '',
    senderCompanyLogoUrl: data.sender_company_logo_url,
    senderCompanyVerified: data.sender_company_verified || false,
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
    senderUserId: m.sender_user_id,
    senderName: m.sender_display_name || '',
    senderAvatarUrl: m.sender_avatar_url,
    senderCompanyName: m.sender_company_name || '',
    senderCompanyLogoUrl: m.sender_company_logo_url,
    senderCompanyVerified: m.sender_company_verified || false,
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
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('conversation_read_states').upsert({ conversation_id: conversationId, user_id: user.id, last_read_at: new Date().toISOString() })
  }
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
