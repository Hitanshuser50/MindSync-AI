"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { MessageCircle, BarChart2, BookOpen, Phone, Brain, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [greeting, setGreeting] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setGreeting(getGreeting())
  }, [])

  useEffect(() => {
    // Only run this check after component has mounted to avoid hydration issues
    if (mounted && !isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router, mounted])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Show loading state while checking authentication
  if (isLoading || !mounted || !user) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold">
            {greeting}, {user?.user_metadata?.name || "Friend"}!
          </h1>
          <p className="text-muted-foreground">Welcome to your mental wellness dashboard. How are you feeling today?</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickStatCard
            icon={<MessageCircle className="h-10 w-10 text-blue-500" />}
            title="Chat Sessions"
            value="5"
            subtitle="Last 7 days"
            delay={0.1}
          />
          <QuickStatCard
            icon={<BarChart2 className="h-10 w-10 text-green-500" />}
            title="Mood Score"
            value="7.5"
            subtitle="Weekly average"
            delay={0.2}
          />
          <QuickStatCard
            icon={<Brain className="h-10 w-10 text-purple-500" />}
            title="Meditation"
            value="45"
            subtitle="Minutes this week"
            delay={0.3}
          />
          <QuickStatCard
            icon={<Sparkles className="h-10 w-10 text-amber-500" />}
            title="Streak"
            value="12"
            subtitle="Days in a row"
            delay={0.4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Continue your conversation</h3>
                  <p className="text-sm text-muted-foreground">Pick up where you left off</p>
                </div>
              </div>
              <Link href="/chat">
                <Button className="w-full">Open Chat</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-100 dark:border-purple-900/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Try a meditation</h3>
                  <p className="text-sm text-muted-foreground">Relax and center yourself</p>
                </div>
              </div>
              <Link href="/self-care">
                <Button className="w-full">Explore Meditations</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionButton
              icon={<MessageCircle className="h-8 w-8 text-primary" />}
              label="Chat Now"
              href="/chat"
              delay={0.1}
            />
            <QuickActionButton
              icon={<BarChart2 className="h-8 w-8 text-blue-500" />}
              label="Log Mood"
              href="/mood"
              delay={0.2}
            />
            <QuickActionButton
              icon={<BookOpen className="h-8 w-8 text-violet-500" />}
              label="Self-Care"
              href="/self-care"
              delay={0.3}
            />
            <QuickActionButton
              icon={<Phone className="h-8 w-8 text-green-500" />}
              label="Get Help"
              href="/emergency"
              delay={0.4}
            />
          </div>
        </div>

        <Link href="/mind-visualizer">
          <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-indigo-100 dark:border-indigo-900/50 hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-full md:w-1/3 aspect-square max-w-[200px]">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-purple-500/20 rounded-full animate-pulse [animation-delay:250ms]"></div>
                  <div className="absolute inset-4 bg-pink-500/20 rounded-full animate-pulse [animation-delay:500ms]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="md:w-2/3 text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2">Explore Your Mind</h2>
                  <p className="text-muted-foreground mb-4">
                    Discover our interactive mind visualizer with engaging activities to understand how your brain
                    works.
                  </p>
                  <Button>Launch Mind Visualizer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function QuickStatCard({ icon, title, value, subtitle, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickActionButton({ icon, label, href, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Link href={href}>
        <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-2 p-4 w-full">
          {icon}
          <span>{label}</span>
        </Button>
      </Link>
    </motion.div>
  )
}

