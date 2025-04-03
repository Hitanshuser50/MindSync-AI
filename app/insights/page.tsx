"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  RefreshCw,
  Download,
} from "lucide-react"
import { motion } from "framer-motion"
import PremiumFeature from "@/components/premium-feature"

export default function InsightsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [insights, setInsights] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchInsights()
  }, [user, router])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would fetch from your AI service
      // For now, we'll use placeholder data
      setTimeout(() => {
        setInsights(placeholderInsights)
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error fetching insights:", error)
      toast({
        title: "Error",
        description: "Failed to load insights. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const generateNewInsights = async () => {
    try {
      setIsGenerating(true)

      // In a real app, this would call your AI service
      // For now, we'll simulate a delay
      toast({
        title: "Generating new insights",
        description: "This may take a moment...",
      })

      setTimeout(() => {
        setInsights(placeholderInsights)
        setIsGenerating(false)

        toast({
          title: "Insights updated",
          description: "Your personalized insights have been refreshed.",
        })
      }, 3000)
    } catch (error) {
      console.error("Error generating insights:", error)
      toast({
        title: "Error",
        description: "Failed to generate new insights. Please try again.",
        variant: "destructive",
      })
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing your data and generating insights...</p>
        </div>
      </div>
    )
  }

  const content = (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">Personalized analysis of your mental wellbeing journey</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                toast({
                  title: "Report downloaded",
                  description: "Your insights report has been downloaded.",
                })
              }}
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2" onClick={generateNewInsights} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mood" className="gap-2">
              <LineChart className="h-4 w-4" />
              Mood Analysis
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <BarChart className="h-4 w-4" />
              Behavior Patterns
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Wellbeing Score</CardTitle>
                    <CardDescription>Your overall mental health index</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-bold">{insights.wellbeingScore}/100</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          insights.wellbeingTrend === "up"
                            ? "text-green-500"
                            : insights.wellbeingTrend === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {insights.wellbeingTrend === "up" ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>+{insights.wellbeingChange}%</span>
                          </>
                        ) : insights.wellbeingTrend === "down" ? (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            <span>-{insights.wellbeingChange}%</span>
                          </>
                        ) : (
                          <span>No change</span>
                        )}
                      </div>
                    </div>
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
                    <CardTitle className="text-lg">Mood Stability</CardTitle>
                    <CardDescription>Consistency of your emotional state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-bold">{insights.moodStability}/10</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          insights.moodStabilityTrend === "up"
                            ? "text-green-500"
                            : insights.moodStabilityTrend === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {insights.moodStabilityTrend === "up" ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>+{insights.moodStabilityChange}%</span>
                          </>
                        ) : insights.moodStabilityTrend === "down" ? (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            <span>-{insights.moodStabilityChange}%</span>
                          </>
                        ) : (
                          <span>No change</span>
                        )}
                      </div>
                    </div>
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
                    <CardTitle className="text-lg">Mindfulness Minutes</CardTitle>
                    <CardDescription>Total meditation time this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-4xl font-bold">{insights.mindfulnessMinutes}</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          insights.mindfulnessTrend === "up"
                            ? "text-green-500"
                            : insights.mindfulnessTrend === "down"
                              ? "text-red-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {insights.mindfulnessTrend === "up" ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            <span>+{insights.mindfulnessChange}%</span>
                          </>
                        ) : insights.mindfulnessTrend === "down" ? (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            <span>-{insights.mindfulnessChange}%</span>
                          </>
                        ) : (
                          <span>No change</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                    <CardDescription>Personalized analysis of your mental wellbeing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{insights.summary}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Strengths</h4>
                          <ul className="text-sm space-y-1">
                            {insights.strengths.map((strength: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Areas to Improve</h4>
                          <ul className="text-sm space-y-1">
                            {insights.areasToImprove.map((area: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Triggers</CardTitle>
                    <CardDescription>Factors that influence your emotional state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Positive Influences</h4>
                        <div className="flex flex-wrap gap-2">
                          {insights.positiveInfluences.map((influence: string, index: number) => (
                            <div
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs"
                            >
                              {influence}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Negative Triggers</h4>
                        <div className="flex flex-wrap gap-2">
                          {insights.negativeTriggers.map((trigger: string, index: number) => (
                            <div
                              key={index}
                              className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs"
                            >
                              {trigger}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="mood">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Patterns</CardTitle>
                  <CardDescription>Analysis of your emotional trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="aspect-[2/1] bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Mood trend chart visualization would appear here</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Key Observations</h3>
                      <ul className="space-y-2">
                        {insights.moodObservations.map((observation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{observation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Best Day of Week</h4>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-medium">{insights.bestDayOfWeek}</div>
                            <div className="text-xs text-muted-foreground">
                              Average mood: {insights.bestDayScore}/10
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Challenging Day of Week</h4>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
                            <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <div className="font-medium">{insights.worstDayOfWeek}</div>
                            <div className="text-xs text-muted-foreground">
                              Average mood: {insights.worstDayScore}/10
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Behavior Patterns</CardTitle>
                  <CardDescription>Analysis of your habits and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="aspect-[2/1] bg-muted rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground">Behavior pattern visualization would appear here</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Activity Impact</h3>
                        <div className="space-y-3">
                          {insights.activityImpact.map((activity: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1.5 rounded-md ${
                                    activity.impact > 0
                                      ? "bg-green-100 dark:bg-green-900/30"
                                      : "bg-red-100 dark:bg-red-900/30"
                                  }`}
                                >
                                  <activity.icon
                                    className={`h-4 w-4 ${
                                      activity.impact > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}
                                  />
                                </div>
                                <span className="text-sm">{activity.name}</span>
                              </div>
                              <div
                                className={`text-sm font-medium ${
                                  activity.impact > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {activity.impact > 0 ? "+" : ""}
                                {activity.impact}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">Correlation Insights</h3>
                        <ul className="space-y-2">
                          {insights.correlations.map((correlation: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Brain className="h-4 w-4 text-primary mt-0.5" />
                              <span>{correlation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>AI-generated suggestions based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Meditation Suggestions</h3>
                        <ul className="space-y-3">
                          {insights.recommendedMeditations.map((meditation: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
                                <Sparkles className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">{meditation.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {meditation.duration} min • {meditation.category}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">Habit Suggestions</h3>
                        <ul className="space-y-3">
                          {insights.recommendedHabits.map((habit: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
                                <Lightbulb className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-sm">{habit}</div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">Focus Areas</h3>
                        <ul className="space-y-3">
                          {insights.focusAreas.map((area: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="p-1.5 bg-primary/10 rounded-md mt-0.5">
                                <area.icon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">{area.title}</div>
                                <div className="text-xs text-muted-foreground">{area.description}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Weekly Plan</h3>
                      <div className="p-4 border rounded-md">
                        <p className="text-sm mb-4">{insights.weeklyPlanIntro}</p>
                        <ul className="space-y-2">
                          {insights.weeklyPlan.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <span className="text-primary font-medium mt-0.5">{index + 1}.</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full gap-2" onClick={() => router.push("/meditations")}>
                    <Sparkles className="h-4 w-4" />
                    Start Recommended Meditation
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  if (!isPremium) {
    return <PremiumFeature>{content}</PremiumFeature>
  }

  return content
}

// Placeholder data for insights
const placeholderInsights = {
  wellbeingScore: 78,
  wellbeingTrend: "up",
  wellbeingChange: 12,

  moodStability: 7.5,
  moodStabilityTrend: "up",
  moodStabilityChange: 8,

  mindfulnessMinutes: 240,
  mindfulnessTrend: "up",
  mindfulnessChange: 15,

  summary:
    "Your mental wellbeing has shown significant improvement over the past month. Your consistent meditation practice and regular mood tracking have contributed positively to your overall stability. Sleep patterns remain an area for potential improvement.",

  strengths: [
    "Consistent meditation practice",
    "Regular mood tracking",
    "Positive response to breathing exercises",
    "Good stress management during weekdays",
  ],

  areasToImprove: [
    "Sleep quality and duration",
    "Weekend anxiety management",
    "Work-life balance",
    "Social connection frequency",
  ],

  positiveInfluences: ["Meditation", "Exercise", "Nature", "Reading", "Family time", "Creative activities"],

  negativeTriggers: ["Work deadlines", "Poor sleep", "Social media", "Traffic", "Caffeine"],

  moodObservations: [
    "Your mood tends to be highest on Saturday mornings and lowest on Sunday evenings",
    "There's a strong correlation between your sleep quality and next-day mood",
    "Meditation sessions longer than 10 minutes have a more lasting positive effect on your mood",
    "Your mood is generally more stable when you've exercised in the past 24 hours",
    "Work-related stress has less impact on your mood when you've practiced mindfulness that day",
  ],

  bestDayOfWeek: "Saturday",
  bestDayScore: 8.2,
  worstDayOfWeek: "Monday",
  worstDayScore: 6.4,

  activityImpact: [
    { name: "Meditation", impact: 24, icon: Brain },
    { name: "Exercise", impact: 18, icon: TrendingUp },
    { name: "Reading", impact: 12, icon: TrendingUp },
    { name: "Social Media", impact: -15, icon: TrendingDown },
    { name: "Work Overtime", impact: -10, icon: TrendingDown },
  ],

  correlations: [
    "Strong correlation between meditation and reduced anxiety the following day",
    "Exercise in the morning correlates with better mood throughout the day",
    "Reading before bed correlates with improved sleep quality",
    "More than 30 minutes of social media correlates with increased stress levels",
    "Time spent outdoors strongly correlates with improved mood",
  ],

  recommendedMeditations: [
    { title: "Deep Sleep Relaxation", duration: 15, category: "Sleep" },
    { title: "Sunday Evening Calm", duration: 10, category: "Anxiety" },
    { title: "Work Stress Relief", duration: 5, category: "Stress" },
  ],

  recommendedHabits: [
    "Wind down routine 30 minutes before bed",
    "Morning sunlight exposure for 10 minutes",
    "Digital sunset 1 hour before bedtime",
    "Mindful breathing during commute",
    "Gratitude journaling before sleep",
  ],

  focusAreas: [
    { title: "Sleep Optimization", description: "Improve quality and consistency", icon: Calendar },
    { title: "Sunday Evening Routine", description: "Reduce start-of-week anxiety", icon: Brain },
    { title: "Work Boundaries", description: "Establish clearer separation", icon: Lightbulb },
  ],

  weeklyPlanIntro:
    "Based on your patterns, here's a suggested plan for the coming week to optimize your mental wellbeing:",

  weeklyPlan: [
    "Start each morning with 5 minutes of mindful breathing to set a positive tone for the day",
    "Practice the 'Deep Sleep Relaxation' meditation on Monday, Wednesday, and Friday evenings",
    "Implement a digital sunset by turning off screens 1 hour before bedtime",
    "Schedule a 15-minute nature break during your workday, especially on Monday and Tuesday",
    "Try the 'Sunday Evening Calm' meditation to prepare for the week ahead",
    "Track your mood at least twice daily to continue building awareness",
    "Limit social media to 20 minutes per day, preferably during mid-day rather than morning or evening",
  ],
}

