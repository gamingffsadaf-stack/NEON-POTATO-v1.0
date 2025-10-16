import { getSupabaseBrowserClient } from "./supabase/client"

export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url: string | null
  status: string
  is_online: boolean
  last_seen: string
  has_free_nitro: boolean
  custom_emoji_slots: number
  max_file_size_mb: number
  username_color: string
  animated_avatar_enabled: boolean
  created_at: string
  updated_at: string
}

export async function getCurrentUserProfile() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (error) throw error
  return data as UserProfile
}

export async function updateUserProfile(updates: {
  username?: string
  status?: string
  username_color?: string
  avatar_url?: string
}) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserById(userId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) throw error
  return data as UserProfile
}

export const NITRO_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#FF5555" },
  { name: "Orange", value: "#FF9955" },
  { name: "Yellow", value: "#FFFF55" },
  { name: "Green", value: "#55FF55" },
  { name: "Cyan", value: "#55FFFF" },
  { name: "Blue", value: "#5555FF" },
  { name: "Purple", value: "#AA55FF" },
  { name: "Pink", value: "#FF55AA" },
  { name: "Gold", value: "#FFD700" },
]
