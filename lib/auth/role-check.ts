import { createClient } from "@/lib/supabase/client"

export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id: string
  devotee_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === 'admin'
}

/**
 * Get current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const profile = await getUserProfile(user.id)
  return profile?.role || null
}

/**
 * Set user role (admin only)
 */
export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ role })
    .eq("id", userId)

  return !error
}

/**
 * Link user to devotee
 */
export async function linkUserToDevotee(userId: string, devoteeId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("user_profiles")
    .update({ devotee_id: devoteeId })
    .eq("id", userId)

  return !error
}

/**
 * Auto-link devotee by phone
 */
export async function autoLinkDevoteeByPhone(userId: string, phoneNumber: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('link_devotee_by_phone', {
    user_id: userId,
    phone_number: phoneNumber
  })

  return !error && data === true
}

