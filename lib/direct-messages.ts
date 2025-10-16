import { getSupabaseBrowserClient } from "./supabase/client"

export interface DMConversation {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  other_user?: {
    id: string
    username: string
    avatar_url: string | null
    is_online: boolean
    username_color: string
  }
  last_message?: {
    content: string
    created_at: string
  }
}

export async function getOrCreateDMConversation(otherUserId: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check if conversation already exists (in either direction)
  const { data: existing } = await supabase
    .from("dm_conversations")
    .select("*")
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
    .single()

  if (existing) {
    return existing
  }

  // Create new conversation
  const { data, error } = await supabase
    .from("dm_conversations")
    .insert({
      user1_id: user.id,
      user2_id: otherUserId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserDMConversations() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get all conversations where user is participant
  const { data: conversations, error } = await supabase
    .from("dm_conversations")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) throw error

  // Enrich with other user data and last message
  const enriched = await Promise.all(
    (conversations || []).map(async (conv) => {
      const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id

      const { data: otherUser } = await supabase
        .from("users")
        .select("id, username, avatar_url, is_online, username_color")
        .eq("id", otherUserId)
        .single()

      const { data: lastMessage } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("dm_conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      return {
        ...conv,
        other_user: otherUser,
        last_message: lastMessage,
      }
    }),
  )

  return enriched
}

export async function getDMMessages(conversationId: string, limit = 50) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      users (id, username, avatar_url, username_color, has_free_nitro)
    `,
    )
    .eq("dm_conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse()
}

export async function sendDMMessage(conversationId: string, content: string, fileUrl?: string, fileName?: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("messages")
    .insert({
      content,
      author_id: user.id,
      dm_conversation_id: conversationId,
      file_url: fileUrl,
      file_name: fileName,
    })
    .select(
      `
      *,
      users (id, username, avatar_url, username_color, has_free_nitro)
    `,
    )
    .single()

  if (error) throw error
  return data
}

export async function searchUsers(query: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, is_online")
    .ilike("username", `%${query}%`)
    .neq("id", user.id)
    .limit(10)

  if (error) throw error
  return data || []
}
