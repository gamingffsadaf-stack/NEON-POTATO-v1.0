import { getSupabaseBrowserClient } from "./supabase/client"
import { getSupabaseServerClient } from "./supabase/server"
import bcrypt from "bcryptjs"

export async function signUp(email: string, username: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
    },
  })

  if (authError) throw authError

  // Create user profile in our users table
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user?.id,
    email,
    username,
    password_hash: passwordHash,
  })

  if (profileError) throw profileError

  return authData
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Update online status
  await supabase.from("users").update({ is_online: true }).eq("id", data.user.id)

  return data
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Update online status
    await supabase.from("users").update({ is_online: false, last_seen: new Date().toISOString() }).eq("id", user.id)
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return profile
}
