"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export type MoodEntry = {
  id: string
  user_id: string
  mood_score: number
  notes: string | null
  created_at: string
}

export type MoodEntryFormData = {
  mood_score: number
  notes?: string | null
}

/**
 * Get mood entries for the current user
 */
export async function getUserMoodEntries(limit = 30) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Get mood entries
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching mood entries:", error)
    throw new Error("Failed to fetch mood entries")
  }

  return data
}

/**
 * Get a specific mood entry
 */
export async function getMoodEntry(id: string) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Get mood entry
  const { data, error } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single()

  if (error) {
    console.error("Error fetching mood entry:", error)
    throw new Error("Failed to fetch mood entry")
  }

  return data
}

/**
 * Create a new mood entry
 */
export async function createMoodEntry(formData: MoodEntryFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Create mood entry
  const { data, error } = await supabase
    .from("mood_entries")
    .insert({
      user_id: session.user.id,
      mood_score: formData.mood_score,
      notes: formData.notes || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating mood entry:", error)
    throw new Error("Failed to create mood entry")
  }

  revalidatePath("/mood-tracker")
  return data
}

/**
 * Update a mood entry
 */
export async function updateMoodEntry(id: string, formData: MoodEntryFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Update mood entry
  const { error } = await supabase
    .from("mood_entries")
    .update({
      mood_score: formData.mood_score,
      notes: formData.notes || null,
    })
    .eq("id", id)
    .eq("user_id", session.user.id)

  if (error) {
    console.error("Error updating mood entry:", error)
    throw new Error("Failed to update mood entry")
  }

  revalidatePath("/mood-tracker")
  return { success: true }
}

/**
 * Delete a mood entry
 */
export async function deleteMoodEntry(id: string) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // Delete mood entry
  const { error } = await supabase.from("mood_entries").delete().eq("id", id).eq("user_id", session.user.id)

  if (error) {
    console.error("Error deleting mood entry:", error)
    throw new Error("Failed to delete mood entry")
  }

  revalidatePath("/mood-tracker")
  return { success: true }
}

