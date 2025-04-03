"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"
import { MessageCircle, BarChart2, Calendar, Flame, Star, Brain, Sparkles, LineChart, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchUserData()
    setGreeting(getGreeting())
  }, [user, router])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would fetch from your database
      // For now, we'll use placeholder data
      setTimeout(() => {
        setUserData({
          name: user?.user_metadata?.name || "Friend",
          streak: 14,
          points: 1250,
          level: 5,
          todayMood: null,
          completedMeditations: 28,
          totalMeditationMinutes: 240,
          moodEntries: 42,
          recentMeditations: [
            {
              id: "med1",
              title: "Deep Sleep Relaxation",
              duration: 15,
              completedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
            },
            {
              id: "med6",
              title: "Bedtime Story Meditation",
              duration: 30,
              completedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            },
          ],
          suggestedMeditations: [
            {
              id: "med2",
              title: "Anxiety Relief Breathing",
              duration: 10,
              category: "anxiety",
            },
            {
              id: "med3",
              title: "Morning Energy Boost",
              duration: 5,
              category: "focus",
            },
          ],
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load your dashboard. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) {
      return "Good morning"
    } else if (hour < 18) {
      return "Good afternoon"
    } else {
      return "Good evening"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === now.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  if (isLoading) {
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
            {greeting}, {userData.name}!
          </h1>
          <p className="text-muted-foreground">
            {userData.todayMood ? `You're feeling ${userData.todayMood} today.` : "How are you feeling today?"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.streak} days</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.points}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Meditations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.completedMeditations}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-500" />
                  Mood Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userData.moodEntries}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Start your wellness journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/chat")}
                  >
                    <MessageCircle className="h-8 w-8 text-primary" />
                    <span>Chat Now</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/mood")}
                  >
                    <BarChart2 className="h-8 w-8 text-blue-500" />
                    <span>Log Mood</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/meditations")}
                  >
                    <Brain className="h-8 w-8 text-violet-500" />
                    <span>Meditate</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center gap-2 p-4"
                    onClick={() => router.push("/insights")}
                  >
                    <LineChart className="h-8 w-8 text-green-500" />
                    <span>Insights</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Today's Goal</CardTitle>
                <CardDescription>Keep your streak going</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[calc(100%-8rem)]">
                {userData.todayMood ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Goal Completed!</h3>
                    <p className="text-sm text-muted-foreground">You've logged your mood today. Great job!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Log Your Mood</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Track how you're feeling to maintain your {userData.streak}-day streak
                    </p>
                    <Button onClick={() => router.push("/mood")}>Log Mood Now</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest wellness activities</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.recentMeditations.length > 0 ? (
                  <div className="space-y-4">
                    {userData.recentMeditations.map((meditation: any) => (
                      <div key={meditation.id} className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{meditation.title}</h4>
                            <span className="text-xs text-muted-foreground">{formatDate(meditation.completedAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{meditation.duration} min meditation</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No recent activity found. Start your wellness journey today!
                    </p>
                    <Button variant="outline" onClick={() => router.push("/meditations")}>
                      Explore Meditations
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/achievements")}>
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Personalized suggestions based on your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.suggestedMeditations.map((meditation: any) => (
                    <div key={meditation.id} className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{meditation.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {meditation.duration} min • {meditation.category}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/meditations/${meditation.id}`)}>
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/meditations")}>
                  View All Meditations
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="md:w-2/3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">Upgrade to Premium</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Unlock advanced insights, premium meditations, and personalized recommendations to enhance your
                      mental wellbeing journey.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Advanced AI Insights
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Premium Meditations
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Unlimited Chat
                      </div>
                      <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        Exclusive Rewards
                      </div>
                    </div>
                    <Button className="gap-2" onClick={() => router.push("/subscription")}>
                      <Sparkles className="h-4 w-4" />
                      Upgrade Now
                    </Button>
                  </div>
                  <div className="md:w-1/3 flex justify-center">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-lg">Premium Plan</h4>
                        <div className="flex items-center justify-center">
                          <span className="text-3xl font-bold">₹499</span>
                          <span className="text-sm text-muted-foreground ml-1">/month</span>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Unlimited AI therapy sessions</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>All premium meditations</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Advanced insights & analytics</span>
                        </li>
                        <li className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>Priority support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

