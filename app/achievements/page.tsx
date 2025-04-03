"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Trophy, Medal, Star, Flame, Calendar, Gift, Clock, CheckCircle, Lock, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

// Types
type Achievement = {
  id: string
  title: string
  description: string
  icon: any
  category: string
  points: number
  isCompleted: boolean
  progress: number
  totalSteps: number
  completedAt?: string
  isPremium?: boolean
}

type Streak = {
  current: number
  longest: number
  lastActive: string
}

type Reward = {
  id: string
  title: string
  description: string
  points: number
  isRedeemed: boolean
  isPremium?: boolean
}

export default function AchievementsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [streak, setStreak] = useState<Streak | null>(null)
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchUserData()
  }, [user, router])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would fetch from your database
      // For now, we'll use placeholder data
      setTimeout(() => {
        setAchievements(placeholderAchievements)
        setRewards(placeholderRewards)
        setStreak(placeholderStreak)
        setPoints(1250)
        setLevel(5)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load achievements. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      // In a real app, this would call your API
      const reward = rewards.find((r) => r.id === rewardId)

      if (!reward) {
        throw new Error("Reward not found")
      }

      if (reward.points > points) {
        toast({
          title: "Not enough points",
          description: `You need ${reward.points - points} more points to redeem this reward.`,
          variant: "destructive",
        })
        return
      }

      // Update local state
      setRewards(rewards.map((r) => (r.id === rewardId ? { ...r, isRedeemed: true } : r)))

      setPoints(points - reward.points)

      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed: ${reward.title}`,
      })
    } catch (error) {
      console.error("Error redeeming reward:", error)
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      })
    }
  }

  const calculateLevelProgress = () => {
    // Simple level calculation: each level requires 300 * level points
    const nextLevelPoints = 300 * level
    const currentLevelPoints = 300 * (level - 1)
    const pointsForCurrentLevel = points - currentLevelPoints
    const progressPercentage = (pointsForCurrentLevel / (nextLevelPoints - currentLevelPoints)) * 100

    return {
      current: pointsForCurrentLevel,
      total: nextLevelPoints - currentLevelPoints,
      percentage: progressPercentage,
    }
  }

  const levelProgress = calculateLevelProgress()

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Achievements & Rewards</h1>
            <p className="text-muted-foreground">Track your progress and earn rewards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span>Level {level}</span>
                </CardTitle>
                <CardDescription>
                  {levelProgress.current} / {levelProgress.total} XP to Level {level + 1}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={levelProgress.percentage} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>Points Balance</span>
                </CardTitle>
                <CardDescription>Available to spend on rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{points} pts</div>
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
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span>Current Streak</span>
                </CardTitle>
                <CardDescription>
                  {streak?.current === 1 ? "1 day" : `${streak?.current} days`} in a row
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{streak?.current}</div>
                  <div className="text-sm text-muted-foreground">Longest: {streak?.longest} days</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="achievements">
          <TabsList className="mb-8">
            <TabsTrigger value="achievements" className="gap-2">
              <Medal className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={achievement.isCompleted ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-md ${achievement.isCompleted ? "bg-primary/10" : "bg-muted"}`}>
                            <achievement.icon
                              className={`h-5 w-5 ${
                                achievement.isCompleted ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {achievement.title}
                              {achievement.isPremium && (
                                <Sparkles className="inline-block ml-1 h-3.5 w-3.5 text-primary" />
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {achievement.category} • {achievement.points} pts
                            </CardDescription>
                          </div>
                        </div>
                        {achievement.isCompleted && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.totalSteps}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.totalSteps) * 100} className="h-1.5" />
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {reward.title}
                          {reward.isPremium && <Sparkles className="inline-block ml-1 h-3.5 w-3.5 text-primary" />}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>{reward.points} pts</span>
                        </div>
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        className="w-full gap-2"
                        variant={reward.isRedeemed ? "outline" : "default"}
                        disabled={reward.isRedeemed || reward.points > points}
                        onClick={() => redeemReward(reward.id)}
                      >
                        {reward.isRedeemed ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Redeemed
                          </>
                        ) : reward.points > points ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Need {reward.points - points} more points
                          </>
                        ) : (
                          <>
                            <Gift className="h-4 w-4" />
                            Redeem Reward
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Keep Going!</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Continue your mental wellbeing journey to earn more achievements and unlock rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="gap-2" onClick={() => router.push("/meditations")}>
              <Clock className="h-4 w-4" />
              Start a Meditation
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => router.push("/mood")}>
              <Calendar className="h-4 w-4" />
              Log Your Mood
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Placeholder data for achievements
const placeholderAchievements: Achievement[] = [
  {
    id: "ach1",
    title: "Meditation Beginner",
    description: "Complete your first 5 meditation sessions",
    icon: Brain,
    category: "Meditation",
    points: 50,
    isCompleted: true,
    progress: 5,
    totalSteps: 5,
    completedAt: "2023-09-15T10:30:00Z",
  },
  {
    id: "ach2",
    title: "Consistent Tracker",
    description: "Log your mood for 7 consecutive days",
    icon: Calendar,
    category: "Mood",
    points: 100,
    isCompleted: true,
    progress: 7,
    totalSteps: 7,
    completedAt: "2023-09-20T18:45:00Z",
  },
  {
    id: "ach3",
    title: "Mindfulness Explorer",
    description: "Try 3 different types of meditation",
    icon: Compass,
    category: "Meditation",
    points: 75,
    isCompleted: true,
    progress: 3,
    totalSteps: 3,
    completedAt: "2023-09-25T14:20:00Z",
  },
  {
    id: "ach4",
    title: "Sleep Improver",
    description: "Complete 10 sleep meditations",
    icon: Moon,
    category: "Sleep",
    points: 150,
    isCompleted: false,
    progress: 6,
    totalSteps: 10,
  },
  {
    id: "ach5",
    title: "Anxiety Master",
    description: "Complete 15 anxiety-reducing exercises",
    icon: Shield,
    category: "Anxiety",
    points: 200,
    isCompleted: false,
    progress: 8,
    totalSteps: 15,
  },
  {
    id: "ach6",
    title: "Meditation Enthusiast",
    description: "Meditate for a total of 60 minutes",
    icon: Clock,
    category: "Meditation",
    points: 125,
    isCompleted: true,
    progress: 60,
    totalSteps: 60,
    completedAt: "2023-10-02T09:15:00Z",
  },
  {
    id: "ach7",
    title: "Insight Seeker",
    description: "View your personalized insights 5 times",
    icon: LineChart,
    category: "Insights",
    points: 100,
    isCompleted: false,
    progress: 3,
    totalSteps: 5,
    isPremium: true,
  },
  {
    id: "ach8",
    title: "Breathing Expert",
    description: "Complete 20 breathing exercises",
    icon: Wind,
    category: "Breathing",
    points: 175,
    isCompleted: false,
    progress: 12,
    totalSteps: 20,
  },
  {
    id: "ach9",
    title: "Mindfulness Marathon",
    description: "Maintain a 30-day streak of activity",
    icon: Flame,
    category: "Consistency",
    points: 300,
    isCompleted: false,
    progress: 14,
    totalSteps: 30,
  },
]

// Placeholder data for streak
const placeholderStreak: Streak = {
  current: 14,
  longest: 21,
  lastActive: new Date().toISOString(),
}

// Placeholder data for rewards
const placeholderRewards: Reward[] = [
  {
    id: "rew1",
    title: "Premium Meditation Pack",
    description: "Unlock a set of 5 premium guided meditations",
    points: 500,
    isRedeemed: false,
    isPremium: true,
  },
  {
    id: "rew2",
    title: "Custom Theme",
    description: "Unlock a custom app theme of your choice",
    points: 300,
    isRedeemed: true,
  },
  {
    id: "rew3",
    title: "Advanced Insights",
    description: "Unlock detailed analysis of your mood patterns",
    points: 750,
    isRedeemed: false,
    isPremium: true,
  },
  {
    id: "rew4",
    title: "Meditation Timer Sounds",
    description: "Unlock 5 additional ambient sounds for meditation",
    points: 200,
    isRedeemed: false,
  },
  {
    id: "rew5",
    title: "Guided Journaling Pack",
    description: "Unlock 10 guided journaling prompts for emotional wellbeing",
    points: 350,
    isRedeemed: false,
  },
  {
    id: "rew6",
    title: "Sleep Stories Collection",
    description: "Unlock a collection of 3 premium sleep stories",
    points: 600,
    isRedeemed: false,
    isPremium: true,
  },
]

// Import missing icons
import { Brain, Compass, Moon, Shield, Wind, LineChart } from "lucide-react"

