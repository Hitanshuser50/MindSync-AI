/**
 * Gemini AI API client for the mental health support app
 */

// Define types for Gemini API requests and responses
type GeminiRequestContent = {
  parts: {
    text: string
  }[]
}

type GeminiRequest = {
  contents: GeminiRequestContent[]
}

type GeminiResponsePart = {
  text: string
}

type GeminiResponseContent = {
  parts: GeminiResponsePart[]
  role: string
}

type GeminiResponse = {
  candidates: {
    content: GeminiResponseContent
    finishReason: string
  }[]
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD-A-jPZbXW7wd8vZZR-YlNWdT17yjg1TU"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

/**
 * Generate a response from Gemini AI
 * @param prompt The user's message
 * @param chatHistory Previous chat messages for context
 * @param language The language for the response (default: 'en')
 * @returns The AI response text
 */
export async function generateGeminiResponse(prompt: string, chatHistory = "", language = "en"): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined")
  }

  // Create system prompt with mental health support context
  // Include language preference in the system context
  const systemContext = `
    You are an empathetic AI mental health assistant. Your purpose is to provide supportive, 
    compassionate responses to users who may be experiencing stress, anxiety, depression, 
    or other mental health challenges. Always respond with warmth and understanding.
    
    Guidelines:
    - Be supportive and non-judgmental
    - Suggest healthy coping strategies when appropriate
    - Recommend breathing exercises or mindfulness techniques when users seem stressed
    - Recognize when to suggest professional help for serious concerns
    - Never diagnose medical conditions or replace professional mental health care
    - Maintain a calm, reassuring tone
    - Keep responses concise and focused on the user's needs
    - Respond in ${language === "en" ? "English" : language === "hi" ? "Hindi" : language} language
    
    Previous conversation context: ${chatHistory}
  `

  // Combine system context with user prompt
  const fullPrompt = `${systemContext}

User: ${prompt}

Response:`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      } as GeminiRequest),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = (await response.json()) as GeminiResponse

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
      throw new Error("No response from Gemini API")
    }

    return data.candidates[0].content.parts[0].text
  } catch (error) {
    console.error("Error generating Gemini response:", error)
    throw error
  }
}

