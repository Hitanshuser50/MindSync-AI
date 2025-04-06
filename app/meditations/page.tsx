"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Search, Clock, Sparkles, Play, Bookmark, BookmarkCheck } from "lucide-react"
import { motion } from "framer-motion"
import { usePremium } from "@/hooks/use-premium"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

// Import the usage limits hook and upgrade prompt
import { useUsageLimits } from "@/hooks/use-usage-limits"
import UpgradePrompt from "@/components/upgrade-prompt"

// Types
type Meditation = {
  id: string
  title: string
  description: string
  duration: number
  category: string
  level: string
  image_url: string
  audio_url: string
  is_premium: boolean
  created_at: string
}

type Favorite = {
  id: string
  user_id: string
  meditation_id: string
  created_at: string
}

export default function MeditationsPage() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const [meditations, setMeditations] = useState<Meditation[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  // Add the usage limits hook
  const {
    usageCount,
    hasReachedLimit,
    incrementUsage,
    getRemainingUsage,
    isAnonymous,
    isPremium: hasPremium,
  } = useUsageLimits("meditations")

  // Add state to track if we should show the limit warning
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  useEffect(() => {
    fetchMeditations()
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchMeditations = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would fetch from your database
      // For now, we'll use the placeholder data
      setMeditations(placeholderMeditations)
    } catch (error) {
      console.error("Error fetching meditations:", error)
      toast({
        title: "Error",
        description: "Failed to load meditations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFavorites = async () => {
    if (!user) return

    try {
      // In a real app, this would fetch from your database
      // For now, we'll use placeholder data
      setFavorites(["med1", "med4"])
    } catch (error) {
      console.error("Error fetching favorites:", error)
    }
  }

  const toggleFavorite = async (meditationId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "default",
      })
      return
    }

    try {
      if (favorites.includes(meditationId)) {
        // Remove from favorites
        setFavorites(favorites.filter((id) => id !== meditationId))
        toast({
          title: "Removed from favorites",
          description: "Meditation removed from your favorites.",
        })
      } else {
        // Add to favorites
        setFavorites([...favorites, meditationId])
        toast({
          title: "Added to favorites",
          description: "Meditation added to your favorites.",
        })
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter meditations based on search query and active category
  const filteredMeditations = meditations.filter((meditation) => {
    const matchesSearch =
      meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meditation.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      activeCategory === "all" ||
      meditation.category === activeCategory ||
      (activeCategory === "favorites" && favorites.includes(meditation.id))

    return matchesSearch && matchesCategory
  })

  // Format duration in minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading meditations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        {hasReachedLimit && showLimitWarning && (
          <UpgradePrompt
            type={isAnonymous ? "anonymous" : "free"}
            feature="meditation sessions"
            onClose={() => setShowLimitWarning(false)}
          />
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Guided Meditations</h1>
            <p className="text-muted-foreground">Discover peace and mindfulness with our guided sessions</p>
          </div>
          <div className="flex items-center gap-4">
            {!hasPremium && (
              <div className="text-sm text-muted-foreground">
                {getRemainingUsage()} session{getRemainingUsage() !== 1 ? "s" : ""} remaining
              </div>
            )}
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meditations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-[250px]"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveCategory}>
          <TabsList className="mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
            <TabsTrigger value="anxiety">Anxiety</TabsTrigger>
            <TabsTrigger value="focus">Focus</TabsTrigger>
            <TabsTrigger value="stress">Stress</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory}>
            {filteredMeditations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No meditations found. Try a different search or category.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setActiveCategory("all")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeditations.map((meditation, index) => (
                  <MeditationCard
                    key={meditation.id}
                    meditation={meditation}
                    isFavorite={favorites.includes(meditation.id)}
                    onToggleFavorite={toggleFavorite}
                    isPremiumUser={isPremium}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function MeditationCard({
  meditation,
  isFavorite,
  onToggleFavorite,
  isPremiumUser,
  delay = 0,
}: {
  meditation: Meditation
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  isPremiumUser: boolean
  delay?: number
}) {
  const { hasReachedLimit, incrementUsage, isAnonymous } = useUsageLimits("meditations")
  const [showLimit, setShowLimit] = useState(false)
  const router = useRouter()

  // Format duration in minutes
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  // Handle meditation start
  const handleStartMeditation = () => {
    // If it's premium content but user is not premium
    if (meditation.is_premium && !isPremiumUser) {
      router.push("/subscription")
      return
    }

    // If free user has reached limit
    if (hasReachedLimit && !isPremiumUser) {
      setShowLimit(true)
      return
    }

    // Otherwise, increment usage and navigate
    if (!isPremiumUser) {
      incrementUsage()
    }
    router.push(`/meditations/${meditation.id}`)
  }

  // If limit warning is showing
  if (showLimit) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
        <UpgradePrompt
          type={isAnonymous ? "anonymous" : "free"}
          feature="meditation sessions"
          onClose={() => setShowLimit(false)}
        />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Card className="h-full overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={meditation.image_url || "/placeholder.svg?height=192&width=384"}
            alt={meditation.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          {meditation.is_premium && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{meditation.title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onToggleFavorite(meditation.id)}
            >
              {isFavorite ? (
                <BookmarkCheck className="h-5 w-5 fill-primary text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
              <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
            </Button>
          </div>
          <CardDescription className="line-clamp-2">{meditation.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(meditation.duration)}</span>
            </div>
            <div className="capitalize">{meditation.level}</div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full gap-2"
            variant={meditation.is_premium && !isPremiumUser ? "outline" : "default"}
            disabled={meditation.is_premium && !isPremiumUser}
            onClick={handleStartMeditation}
          >
            {meditation.is_premium && !isPremiumUser ? (
              <>
                <Sparkles className="h-4 w-4" />
                Unlock with Premium
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play Meditation
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Placeholder data for meditations
const placeholderMeditations: Meditation[] = [
  {
    id: "med1",
    title: "Deep Sleep Relaxation",
    description:
      "Fall asleep faster with this calming meditation designed to quiet the mind and prepare your body for deep, restful sleep.",
    duration: 900, // 15 minutes
    category: "sleep",
    level: "beginner",
    image_url: "/placeholder.svg?height=192&width=384&text=Sleep+Meditation",
    audio_url: "/meditations/sleep-relaxation.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med2",
    title: "Anxiety Relief Breathing",
    description:
      "A guided breathing exercise to help reduce anxiety and bring a sense of calm during stressful moments.",
    duration: 600, // 10 minutes
    category: "anxiety",
    level: "beginner",
    image_url: "/placeholder.svg?height=192&width=384&text=Anxiety+Relief",
    audio_url: "/meditations/anxiety-relief.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med3",
    title: "Morning Energy Boost",
    description:
      "Start your day with clarity and positive energy. This meditation helps set intentions and energize your mind and body.",
    duration: 300, // 5 minutes
    category: "focus",
    level: "beginner",
    image_url: "/placeholder.svg?height=192&width=384&text=Morning+Energy",
    audio_url: "/meditations/morning-energy.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med4",
    title: "Stress Reduction Body Scan",
    description:
      "Release tension throughout your body with this progressive relaxation technique that brings awareness to each part of your body.",
    duration: 1200, // 20 minutes
    category: "stress",
    level: "intermediate",
    image_url: "/placeholder.svg?height=192&width=384&text=Body+Scan",
    audio_url: "/meditations/body-scan.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med5",
    title: "Deep Focus Concentration",
    description:
      "Enhance your ability to concentrate and maintain focus with this meditation designed for improved productivity.",
    duration: 900, // 15 minutes
    category: "focus",
    level: "intermediate",
    image_url: "/placeholder.svg?height=192&width=384&text=Deep+Focus",
    audio_url: "/meditations/deep-focus.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med6",
    title: "Bedtime Story Meditation",
    description: "A soothing narrative journey to help you drift off to sleep naturally and peacefully.",
    duration: 1800, // 30 minutes
    category: "sleep",
    level: "beginner",
    image_url: "/placeholder.svg?height=192&width=384&text=Bedtime+Story",
    audio_url: "/meditations/bedtime-story.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med7",
    title: "Anxiety Management for Work",
    description:
      "Learn techniques to manage workplace anxiety and stress with this guided meditation focused on professional environments.",
    duration: 720, // 12 minutes
    category: "anxiety",
    level: "intermediate",
    image_url: "/placeholder.svg?height=192&width=384&text=Work+Anxiety",
    audio_url: "/meditations/work-anxiety.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med8",
    title: "Loving-Kindness Meditation",
    description: "Cultivate compassion for yourself and others with this heart-centered meditation practice.",
    duration: 900, // 15 minutes
    category: "stress",
    level: "intermediate",
    image_url: "/placeholder.svg?height=192&width=384&text=Loving+Kindness",
    audio_url: "/meditations/loving-kindness.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med9",
    title: "Deep Sleep Journey",
    description:
      "An immersive guided visualization that takes you on a peaceful journey to promote deep, restorative sleep.",
    duration: 2400, // 40 minutes
    category: "sleep",
    level: "advanced",
    image_url: "/placeholder.svg?height=192&width=384&text=Sleep+Journey",
    audio_url: "/meditations/sleep-journey.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
]

