import { supabase } from "@/lib/supabase"
import { generateGeminiResponse } from "@/lib/gemini-ai"

export type ChatMessage = {
  id?: string
  user_id: string
  role: "user" | "assistant"
  content: string
  language?: string
  created_at?: string
}

/**
 * Save a chat message to the database
 */
export async function saveChatMessage(message: ChatMessage): Promise<ChatMessage> {
  try {
    const { data, error } = await supabase.from("chat_messages").insert(message).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error saving chat message:", error)
    throw error
  }
}

/**
 * Get chat history for a user
 */
export async function getChatHistory(userId: string, limit = 20): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching chat history:", error)
    throw error
  }
}

/**
 * Detect language of the text
 * Simple detection for common languages
 */
export function detectLanguage(text: string): string {
  // Hindi Unicode range check (simplified)
  const hindiPattern = /[\u0900-\u097F]/
  if (hindiPattern.test(text)) {
    return "hi"
  }

  // Add more language detection as needed

  // Default to English
  return "en"
}

/**
 * Generate a chat response using Gemini AI
 */
export async function generateChatResponse(userId: string, message: string): Promise<string> {
  try {
    // Detect language
    const language = detectLanguage(message)

    // Get recent chat history for context
    const chatHistory = await getChatHistory(userId, 10)

    // Format chat history for the AI context
    const formattedHistory = chatHistory
      .reverse()
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    // Generate response from Gemini
    const response = await generateGeminiResponse(message, formattedHistory, language)

    // Save user message
    await saveChatMessage({
      user_id: userId,
      role: "user",
      content: message,
      language,
    })

    // Save assistant response
    await saveChatMessage({
      user_id: userId,
      role: "assistant",
      content: response,
      language,
    })

    return response
  } catch (error) {
    console.error("Error generating chat response:", error)
    throw error
  }
}

