"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export type EmergencyContact = {
  id: string
  name: string
  description: string
  phone: string | null
  website: string | null
  country: string | null
  is_global: boolean
}

export type EmergencyContactFormData = {
  name: string
  description: string
  phone?: string | null
  website?: string | null
  country?: string | null
  is_global: boolean
}

/**
 * Get all emergency contacts
 */
export async function getEmergencyContacts() {
  const supabase = createServerActionClient({ cookies })

  // Get emergency contacts
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .order("is_global", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching emergency contacts:", error)
    throw new Error("Failed to fetch emergency contacts")
  }

  return data
}

/**
 * Get emergency contacts by country
 */
export async function getEmergencyContactsByCountry(country: string) {
  const supabase = createServerActionClient({ cookies })

  // Get emergency contacts
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("country", country)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching emergency contacts:", error)
    throw new Error("Failed to fetch emergency contacts")
  }

  return data
}

/**
 * Get global emergency contacts
 */
export async function getGlobalEmergencyContacts() {
  const supabase = createServerActionClient({ cookies })

  // Get emergency contacts
  const { data, error } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("is_global", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching emergency contacts:", error)
    throw new Error("Failed to fetch emergency contacts")
  }

  return data
}

/**
 * Create a new emergency contact (admin only)
 */
export async function createEmergencyContact(formData: EmergencyContactFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Create emergency contact
  const { data, error } = await supabase
    .from("emergency_contacts")
    .insert({
      name: formData.name,
      description: formData.description,
      phone: formData.phone || null,
      website: formData.website || null,
      country: formData.country || null,
      is_global: formData.is_global,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating emergency contact:", error)
    throw new Error("Failed to create emergency contact")
  }

  revalidatePath("/emergency")
  return data
}

/**
 * Update an emergency contact (admin only)
 */
export async function updateEmergencyContact(id: string, formData: EmergencyContactFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Update emergency contact
  const { error } = await supabase
    .from("emergency_contacts")
    .update({
      name: formData.name,
      description: formData.description,
      phone: formData.phone || null,
      website: formData.website || null,
      country: formData.country || null,
      is_global: formData.is_global,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating emergency contact:", error)
    throw new Error("Failed to update emergency contact")
  }

  revalidatePath("/emergency")
  return { success: true }
}

/**
 * Delete an emergency contact (admin only)
 */
export async function deleteEmergencyContact(id: string) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Delete emergency contact
  const { error } = await supabase.from("emergency_contacts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting emergency contact:", error)
    throw new Error("Failed to delete emergency contact")
  }

  revalidatePath("/emergency")
  return { success: true }
}

