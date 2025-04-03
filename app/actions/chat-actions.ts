"use server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export type ChatMessage = {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  language?: string
  created_at: string
}

/**
 * Get chat history for the current user
 */
export async function getUserChatHistory(): Promise<ChatMessage[]> {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return []
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(50)

  if (error) {
    console.error("Error fetching chat history:", error)
    throw error
  }

  return data as ChatMessage[]
}

/**
 * Save a chat message for the current user
 */
export async function saveChatMessage(role: "user" | "assistant", content: string, language = "en"): Promise<void> {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("chat_messages").insert({
    user_id: session.user.id,
    role,
    content,
    language,
  })

  if (error) {
    console.error("Error saving chat message:", error)
    throw error
  }
}

/**
 * Clear chat history for the current user
 */
export async function clearChatHistory(): Promise<void> {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("chat_messages").delete().eq("user_id", session.user.id)

  if (error) {
    console.error("Error clearing chat history:", error)
    throw error
  }
}

