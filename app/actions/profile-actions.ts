"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export type ProfileFormData = {
  username: string
  avatar_url?: string | null
}

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Get profile data
  const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    throw new Error("Failed to fetch profile")
  }

  return data
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(formData: ProfileFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      username: formData.username,
      avatar_url: formData.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.user.id)

  if (error) {
    console.error("Error updating profile:", error)
    throw new Error("Failed to update profile")
  }

  revalidatePath("/profile")
  return { success: true }
}

