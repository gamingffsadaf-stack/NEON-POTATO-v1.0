import { getSupabaseBrowserClient } from "./supabase/client"

export interface Notification {
  id: string
  user_id: string
  type: string
  content: string
  is_read: boolean
  related_message_id: string | null
  created_at: string
}

export async function getUserNotifications(limit = 20) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getUnreadNotificationCount() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) throw error
  return count || 0
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) throw error
}

export async function markAllNotificationsAsRead() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)

  if (error) throw error
}

export async function createNotification(userId: string, type: string, content: string, relatedMessageId?: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      content,
      related_message_id: relatedMessageId || null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNotification(notificationId: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

  if (error) throw error
}
