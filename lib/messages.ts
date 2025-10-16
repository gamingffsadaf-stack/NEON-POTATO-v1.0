import { getSupabaseBrowserClient } from "./supabase/client"

export interface Message {
  id: string
  content: string
  author_id: string
  channel_id: string | null
  dm_conversation_id: string | null
  file_url: string | null
  file_name: string | null
  file_size_mb: number | null
  is_edited: boolean
  created_at: string
  updated_at: string
  users?: {
    id: string
    username: string
    avatar_url: string | null
    username_color: string
    has_free_nitro: boolean
  }
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export async function getChannelMessages(channelId: string, limit = 50) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      users (id, username, avatar_url, username_color, has_free_nitro)
    `,
    )
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse()
}

export async function sendMessage(channelId: string, content: string, fileUrl?: string, fileName?: string) {
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
      channel_id: channelId,
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

export async function addReaction(messageId: string, emoji: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("message_reactions")
    .insert({
      message_id: messageId,
      user_id: user.id,
      emoji,
    })
    .select()
    .single()

  if (error) {
    // If already exists, remove it (toggle)
    if (error.code === "23505") {
      await removeReaction(messageId, emoji)
      return null
    }
    throw error
  }

  return data
}

export async function removeReaction(messageId: string, emoji: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.id)
    .eq("emoji", emoji)

  if (error) throw error
}

export async function getMessageReactions(messageId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("message_reactions").select("*").eq("message_id", messageId)

  if (error) throw error
  return data || []
}

export async function setTypingIndicator(channelId: string, isTyping: boolean) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  if (isTyping) {
    await supabase.from("typing_indicators").upsert({
      user_id: user.id,
      channel_id: channelId,
      started_at: new Date().toISOString(),
    })
  } else {
    await supabase.from("typing_indicators").delete().eq("user_id", user.id).eq("channel_id", channelId)
  }
}

export async function getTypingUsers(channelId: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get typing indicators from last 5 seconds
  const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString()

  const { data, error } = await supabase
    .from("typing_indicators")
    .select("*, users (username)")
    .eq("channel_id", channelId)
    .neq("user_id", user?.id || "")
    .gte("started_at", fiveSecondsAgo)

  if (error) throw error
  return data || []
}
