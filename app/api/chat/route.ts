import { NextResponse } from "next/server"
import { generateGeminiResponse } from "@/lib/gemini-ai"
import { generateChatResponse, detectLanguage } from "@/lib/chat-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { message, language } = await req.json()

    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(message)

    // Get the current user from Supabase
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      // For anonymous users, just generate a response without saving to DB
      const response = await generateGeminiResponse(message, "", detectedLanguage)
      return NextResponse.json({ response, success: true, language: detectedLanguage })
    }

    // For authenticated users, use the chat service to save history
    const response = await generateChatResponse(session.user.id, message)

    return NextResponse.json({
      response,
      success: true,
      language: detectedLanguage,
    })
  } catch (error) {
    console.error("Error in chat API:", error)

    // Provide a fallback response if the AI service fails
    const fallbackResponses = {
      en: [
        "I'm here to support you. Could you tell me more about how you're feeling?",
        "Thank you for sharing. Would you like to try a quick breathing exercise to help center yourself?",
        "I understand this might be difficult. Remember that it's okay to take things one step at a time.",
        "I appreciate you reaching out. How can I best support you right now?",
        "Sometimes talking about our feelings can help. Would you like to explore this further?",
      ],
      hi: [
        "मैं आपका समर्थन करने के लिए यहां हूं। क्या आप मुझे बता सकते हैं कि आप कैसा महसूस कर रहे हैं?",
        "साझा करने के लिए धन्यवाद। क्या आप अपने आप को केंद्रित करने में मदद करने के लिए एक त्वरित श्वास व्यायाम करना चाहेंगे?",
        "मैं समझता हूं कि यह मुश्किल हो सकता है। याद रखें कि एक समय में एक कदम उठाना ठीक है।",
        "मैं आपके संपर्क की सराहना करता हूं। मैं अभी आपका सबसे अच्छा समर्थन कैसे कर सकता हूं?",
        "कभी-कभी अपनी भावनाओं के बारे में बात करने से मदद मिल सकती है। क्या आप इस पर और विचार करना चाहेंगे?",
      ],
    }

    const language = detectLanguage((await req.json()).message) || "en"
    const fallbackArray = fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en
    const fallbackResponse = fallbackArray[Math.floor(Math.random() * fallbackArray.length)]

    return NextResponse.json({
      response: fallbackResponse,
      success: true,
      fallback: true,
      language,
    })
  }
}

