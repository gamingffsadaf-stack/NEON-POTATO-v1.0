import { getSupabaseBrowserClient } from "./supabase/client"

export interface Server {
  id: string
  name: string
  icon_url: string | null
  owner_id: string
  invite_code: string
  boost_level: number
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  server_id: string
  name: string
  type: string
  position: number
  created_at: string
  updated_at: string
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase()
}

export async function createServer(name: string, iconUrl?: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const inviteCode = generateInviteCode()

  const { data: server, error: serverError } = await supabase
    .from("servers")
    .insert({
      name,
      icon_url: iconUrl,
      owner_id: user.id,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (serverError) throw serverError

  // Add owner as member
  const { error: memberError } = await supabase.from("server_members").insert({
    server_id: server.id,
    user_id: user.id,
    role: "owner",
  })

  if (memberError) throw memberError

  // Create default general channel
  await createChannel(server.id, "general")

  return server
}

export async function joinServerByInvite(inviteCode: string) {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Find server by invite code
  const { data: server, error: serverError } = await supabase
    .from("servers")
    .select("*")
    .eq("invite_code", inviteCode)
    .single()

  if (serverError) throw serverError

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("server_members")
    .select("*")
    .eq("server_id", server.id)
    .eq("user_id", user.id)
    .single()

  if (existingMember) {
    return server
  }

  // Add as member
  const { error: memberError } = await supabase.from("server_members").insert({
    server_id: server.id,
    user_id: user.id,
    role: "member",
  })

  if (memberError) throw memberError

  return server
}

export async function getUserServers() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: memberships, error } = await supabase
    .from("server_members")
    .select("server_id, servers(*)")
    .eq("user_id", user.id)

  if (error) throw error

  return memberships?.map((m: any) => m.servers) || []
}

export async function getServerById(serverId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("servers").select("*").eq("id", serverId).single()

  if (error) throw error
  return data
}

export async function createChannel(serverId: string, name: string, type = "text") {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Get current max position
  const { data: channels } = await supabase.from("channels").select("position").eq("server_id", serverId)

  const maxPosition = channels?.reduce((max, ch) => Math.max(max, ch.position), 0) || 0

  const { data, error } = await supabase
    .from("channels")
    .insert({
      server_id: serverId,
      name,
      type,
      position: maxPosition + 1,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getServerChannels(serverId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("channels").select("*").eq("server_id", serverId).order("position")

  if (error) throw error
  return data || []
}

export async function deleteChannel(channelId: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("channels").delete().eq("id", channelId)

  if (error) throw error
}

export async function getServerMembers(serverId: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("server_members")
    .select("*, users(*)")
    .eq("server_id", serverId)
    .order("joined_at")

  if (error) throw error
  return data || []
}
