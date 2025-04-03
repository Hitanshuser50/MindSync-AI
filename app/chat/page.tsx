"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2, Info, Trash, Globe } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getUserChatHistory, clearChatHistory, saveChatMessage } from "@/app/actions/chat-actions"
import { usePremium } from "@/hooks/use-premium"

type Message = {
  role: "user" | "assistant"
  content: string
  language?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm here to support you with your mental health journey. How are you feeling today?",
      language: "en",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [language, setLanguage] = useState<string>("en")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, session, refreshSession } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { isPremium } = usePremium()

  // Load chat history for authenticated users
  useEffect(() => {
    if (user) {
      loadChatHistory()
    } else {
      setIsLoadingHistory(false)
    }
  }, [user])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadChatHistory = async () => {
    try {
      // Ensure session is valid before proceeding
      await refreshSession()

      const history = await getUserChatHistory()

      if (history && history.length > 0) {
        // Convert to Message format and reverse to get chronological order
        const formattedHistory = history
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
            language: msg.language || "en",
          }))
          .reverse()

        setMessages(formattedHistory)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      // Keep the default welcome message
      toast({
        title: "Error",
        description: "Failed to load chat history. Using default conversation.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleClearHistory = async () => {
    if (!user) return

    try {
      await clearChatHistory()

      setMessages([
        {
          role: "assistant",
          content: "Hello! I'm here to support you with your mental health journey. How are you feeling today?",
          language: "en",
        },
      ])

      toast({
        title: "Chat History Cleared",
        description: "Your conversation history has been deleted.",
      })
    } catch (error) {
      console.error("Error clearing chat history:", error)
      toast({
        title: "Error",
        description: "Failed to clear chat history. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input, language }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Ensure session is valid before proceeding
      if (user) {
        await refreshSession()
        // Save user message if authenticated
        await saveChatMessage("user", input)
      }

      // Call our API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, language }),
      })

      if (!response.ok) {
        throw new Error("Failed to get a response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        language: data.language || language,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Update detected language
      if (data.language) {
        setLanguage(data.language)
      }

      // Save assistant message if authenticated
      if (user) {
        await saveChatMessage("assistant", data.response)
      }

      if (data.fallback) {
        toast({
          title: "AI Service Temporarily Unavailable",
          description: "Using backup responses. Please try again later.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })

      // Add a fallback message
      const fallbackMessage: Message = {
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        language: "en",
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const languageNames: Record<string, string> = {
    en: "English",
    hi: "हिंदी (Hindi)",
    bn: "বাংলা (Bengali)",
    te: "తెలుగు (Telugu)",
    ta: "தமிழ் (Tamil)",
    mr: "मराठी (Marathi)",
    gu: "ગુજરાતી (Gujarati)",
    kn: "ಕನ್ನಡ (Kannada)",
    ml: "മലയാളം (Malayalam)",
    pa: "ਪੰਜਾਬੀ (Punjabi)",
  }

  if (isLoadingHistory) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Mindful Chat</h2>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title="Select Language">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(languageNames).map(([code, name]) => (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => setLanguage(code)}
                        className={language === code ? "bg-muted" : ""}
                      >
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {user && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to clear your entire chat history? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>About Mindful Chat</AlertDialogTitle>
                      <AlertDialogDescription>
                        <p className="mb-4">
                          This chat is powered by AI and designed to provide emotional support and mindfulness guidance.
                          While it can offer suggestions and a listening ear, it's not a replacement for professional
                          mental health care.
                        </p>
                        <p className="mb-4">
                          If you're experiencing a crisis or emergency, please contact a mental health professional or
                          emergency services immediately.
                        </p>
                        <p>
                          Your conversations are{" "}
                          {user
                            ? "saved to provide better support in future chats"
                            : "not saved when you're not signed in"}
                          .
                        </p>
                        {!isPremium && (
                          <p className="mt-4 text-primary">
                            Upgrade to Premium for unlimited AI therapy sessions and personalized mental health
                            insights.
                          </p>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction>I understand</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      {message.role === "assistant" ? (
                        <>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>AI</AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Textarea
                  placeholder={language === "en" ? "Type your message here..." : "अपना संदेश यहां लिखें..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[60px] flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim() && !isLoading) {
                        handleSendMessage(e)
                      }
                    }
                  }}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

