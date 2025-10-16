import { getSupabaseBrowserClient } from "./supabase/client"

export interface CustomEmoji {
  id: string
  server_id: string | null
  user_id: string | null
  name: string
  image_url: string
  is_animated: boolean
  created_at: string
}

export async function getServerEmojis(serverId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("custom_emojis")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserEmojis() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("custom_emojis")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createCustomEmoji(name: string, imageUrl: string, isAnimated: boolean, serverId?: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("custom_emojis")
    .insert({
      name,
      image_url: imageUrl,
      is_animated: isAnimated,
      server_id: serverId || null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCustomEmoji(emojiId: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("custom_emojis").delete().eq("id", emojiId)

  if (error) throw error
}
