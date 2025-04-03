"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export type Resource = {
  id: string
  title: string
  description: string
  content: string
  category: string
  image_url: string | null
  created_at: string
}

export type ResourceFormData = {
  title: string
  description: string
  content: string
  category: string
  image_url?: string | null
}

/**
 * Get all resources
 */
export async function getResources() {
  const supabase = createServerActionClient({ cookies })

  // Get resources
  const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching resources:", error)
    throw new Error("Failed to fetch resources")
  }

  return data
}

/**
 * Get resources by category
 */
export async function getResourcesByCategory(category: string) {
  const supabase = createServerActionClient({ cookies })

  // Get resources
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching resources:", error)
    throw new Error("Failed to fetch resources")
  }

  return data
}

/**
 * Get a specific resource
 */
export async function getResource(id: string) {
  const supabase = createServerActionClient({ cookies })

  // Get resource
  const { data, error } = await supabase.from("resources").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching resource:", error)
    throw new Error("Failed to fetch resource")
  }

  return data
}

/**
 * Create a new resource (admin only)
 */
export async function createResource(formData: ResourceFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Create resource
  const { data, error } = await supabase
    .from("resources")
    .insert({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      category: formData.category,
      image_url: formData.image_url || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating resource:", error)
    throw new Error("Failed to create resource")
  }

  revalidatePath("/self-care")
  return data
}

/**
 * Update a resource (admin only)
 */
export async function updateResource(id: string, formData: ResourceFormData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Update resource
  const { error } = await supabase
    .from("resources")
    .update({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      category: formData.category,
      image_url: formData.image_url || null,
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating resource:", error)
    throw new Error("Failed to update resource")
  }

  revalidatePath("/self-care")
  revalidatePath(`/self-care/${id}`)
  return { success: true }
}

/**
 * Delete a resource (admin only)
 */
export async function deleteResource(id: string) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  // TODO: Add admin check here

  // Delete resource
  const { error } = await supabase.from("resources").delete().eq("id", id)

  if (error) {
    console.error("Error deleting resource:", error)
    throw new Error("Failed to delete resource")
  }

  revalidatePath("/self-care")
  return { success: true }
}

