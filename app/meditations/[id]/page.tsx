"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { usePremium } from "@/hooks/use-premium"
import { useAuth } from "@/components/auth-provider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ArrowLeft,
  Clock,
  Bookmark,
  BookmarkCheck,
  Share2,
  Download,
  Sparkles,
} from "lucide-react"
import { motion } from "framer-motion"
import PremiumFeature from "@/components/premium-feature"

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

export default function MeditationPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { isPremium } = usePremium()

  const [meditation, setMeditation] = useState<Meditation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    fetchMeditation()

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [params.id])

  const fetchMeditation = async () => {
    try {
      setIsLoading(true)

      // In a real app, this would fetch from your database
      // For now, we'll use the placeholder data
      const meditationData = placeholderMeditations.find((m) => m.id === params.id)

      if (!meditationData) {
        throw new Error("Meditation not found")
      }

      setMeditation(meditationData)

      // Check if this is a favorite
      if (user) {
        // In a real app, this would check from your database
        setIsFavorite(["med1", "med4"].includes(meditationData.id))
      }

      // Initialize audio
      const audio = new Audio()
      audio.src = meditationData.audio_url
      audio.volume = volume

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentTime(0)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      })

      audio.addEventListener("error", () => {
        setError("Failed to load audio. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load audio. Please try again.",
          variant: "destructive",
        })
      })

      audioRef.current = audio
    } catch (error: any) {
      console.error("Error fetching meditation:", error)
      setError(error.message || "Failed to load meditation")

      toast({
        title: "Error",
        description: error.message || "Failed to load meditation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    } else {
      audioRef.current.play()
      animationRef.current = requestAnimationFrame(updateProgress)
    }

    setIsPlaying(!isPlaying)
  }

  const updateProgress = () => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)
    animationRef.current = requestAnimationFrame(updateProgress)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)

    if (!isPlaying) {
      togglePlayPause()
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return

    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleRestart = () => {
    if (!audioRef.current) return

    audioRef.current.currentTime = 0
    setCurrentTime(0)

    if (!isPlaying) {
      togglePlayPause()
    }
  }

  const handleSkipForward = () => {
    if (!audioRef.current) return

    const newTime = Math.min(audioRef.current.currentTime + 30, duration)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleSkipBackward = () => {
    if (!audioRef.current) return

    const newTime = Math.max(audioRef.current.currentTime - 10, 0)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "default",
      })
      return
    }

    try {
      setIsFavorite(!isFavorite)

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? "Meditation removed from your favorites." : "Meditation added to your favorites.",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)

      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading meditation...</p>
        </div>
      </div>
    )
  }

  if (!meditation) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Meditation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The meditation you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/meditations")}>Back to Meditations</Button>
        </div>
      </div>
    )
  }

  // Check if premium content is accessible
  const isPremiumContent = meditation.is_premium && !isPremium

  const content = (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/meditations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meditations
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={meditation.image_url || "/placeholder.svg?height=400&width=400"}
                alt={meditation.title}
                className="h-full w-full object-cover"
              />
              {meditation.is_premium && (
                <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Premium</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <h1 className="text-3xl font-bold mb-2">{meditation.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(meditation.duration)}</span>
              </div>
              <div className="capitalize">{meditation.level}</div>
              <div className="capitalize">{meditation.category}</div>
            </div>
            <p className="text-muted-foreground mb-6">{meditation.description}</p>

            <div className="flex gap-3 mt-auto">
              <Button
                variant="outline"
                size="icon"
                className={isFavorite ? "text-primary" : ""}
                onClick={toggleFavorite}
              >
                {isFavorite ? <BookmarkCheck className="h-5 w-5 fill-primary" /> : <Bookmark className="h-5 w-5" />}
                <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast({
                    title: "Link copied",
                    description: "Meditation link copied to clipboard.",
                  })
                }}
              >
                <Share2 className="h-5 w-5" />
                <span className="sr-only">Share</span>
              </Button>
              {!meditation.is_premium && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    toast({
                      title: "Download started",
                      description: "Your meditation is downloading.",
                    })
                  }}
                >
                  <Download className="h-5 w-5" />
                  <span className="sr-only">Download</span>
                </Button>
              )}
            </div>
          </motion.div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  aria-label="Seek time"
                  disabled={isPremiumContent}
                />
              </div>

              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleSkipBackward}
                  disabled={isPremiumContent}
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="sr-only">Skip backward 10 seconds</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleRestart}
                  disabled={isPremiumContent}
                >
                  <SkipBack className="h-5 w-5" />
                  <span className="sr-only">Restart</span>
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-14 w-14 rounded-full"
                  onClick={togglePlayPause}
                  disabled={isPremiumContent}
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleSkipForward}
                  disabled={isPremiumContent}
                >
                  <SkipForward className="h-5 w-5" />
                  <span className="sr-only">Skip forward 30 seconds</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleMute}
                  disabled={isPremiumContent}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  aria-label="Volume"
                  className="w-32"
                  disabled={isPremiumContent}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (isPremiumContent) {
    return <PremiumFeature>{content}</PremiumFeature>
  }

  return content
}

// Placeholder data for meditations
const placeholderMeditations: Meditation[] = [
  {
    id: "med1",
    title: "Deep Sleep Relaxation",
    description:
      "Fall asleep faster with this calming meditation designed to quiet the mind and prepare your body for deep, restful sleep. This guided meditation uses progressive relaxation techniques and soothing visualizations to help you release the tensions of the day and drift into a peaceful slumber.",
    duration: 900, // 15 minutes
    category: "sleep",
    level: "beginner",
    image_url: "/placeholder.svg?height=400&width=400&text=Sleep+Meditation",
    audio_url: "/meditations/sleep-relaxation.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med2",
    title: "Anxiety Relief Breathing",
    description:
      "A guided breathing exercise to help reduce anxiety and bring a sense of calm during stressful moments. This meditation focuses on diaphragmatic breathing patterns that activate your parasympathetic nervous system, helping to reduce stress hormones and create a feeling of safety and peace.",
    duration: 600, // 10 minutes
    category: "anxiety",
    level: "beginner",
    image_url: "/placeholder.svg?height=400&width=400&text=Anxiety+Relief",
    audio_url: "/meditations/anxiety-relief.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med3",
    title: "Morning Energy Boost",
    description:
      "Start your day with clarity and positive energy. This meditation helps set intentions and energize your mind and body. Using visualization techniques and gentle movement cues, this practice will help you feel centered, motivated, and ready to face the day with confidence.",
    duration: 300, // 5 minutes
    category: "focus",
    level: "beginner",
    image_url: "/placeholder.svg?height=400&width=400&text=Morning+Energy",
    audio_url: "/meditations/morning-energy.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med4",
    title: "Stress Reduction Body Scan",
    description:
      "Release tension throughout your body with this progressive relaxation technique that brings awareness to each part of your body. This premium meditation guides you through a detailed body scan, helping you identify and release physical tension while cultivating mindful awareness of bodily sensations.",
    duration: 1200, // 20 minutes
    category: "stress",
    level: "intermediate",
    image_url: "/placeholder.svg?height=400&width=400&text=Body+Scan",
    audio_url: "/meditations/body-scan.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med5",
    title: "Deep Focus Concentration",
    description:
      "Enhance your ability to concentrate and maintain focus with this meditation designed for improved productivity. This premium session uses specific sound frequencies and guided visualization to help you enter a state of flow, making it easier to concentrate on important tasks and reduce distractions.",
    duration: 900, // 15 minutes
    category: "focus",
    level: "intermediate",
    image_url: "/placeholder.svg?height=400&width=400&text=Deep+Focus",
    audio_url: "/meditations/deep-focus.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med6",
    title: "Bedtime Story Meditation",
    description:
      "A soothing narrative journey to help you drift off to sleep naturally and peacefully. This meditation combines storytelling with relaxation techniques to help quiet your mind and prepare your body for deep, restful sleep.",
    duration: 1800, // 30 minutes
    category: "sleep",
    level: "beginner",
    image_url: "/placeholder.svg?height=400&width=400&text=Bedtime+Story",
    audio_url: "/meditations/bedtime-story.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med7",
    title: "Anxiety Management for Work",
    description:
      "Learn techniques to manage workplace anxiety and stress with this guided meditation focused on professional environments. This premium meditation provides specific tools for handling difficult workplace situations, managing relationships with colleagues, and maintaining calm during high-pressure moments.",
    duration: 720, // 12 minutes
    category: "anxiety",
    level: "intermediate",
    image_url: "/placeholder.svg?height=400&width=400&text=Work+Anxiety",
    audio_url: "/meditations/work-anxiety.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "med8",
    title: "Loving-Kindness Meditation",
    description:
      "Cultivate compassion for yourself and others with this heart-centered meditation practice. This meditation guides you through the traditional metta (loving-kindness) practice, helping you develop feelings of goodwill, kindness, and warmth toward yourself and progressively toward others.",
    duration: 900, // 15 minutes
    category: "stress",
    level: "intermediate",
    image_url: "/placeholder.svg?height=400&width=400&text=Loving+Kindness",
    audio_url: "/meditations/loving-kindness.mp3",
    is_premium: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "med9",
    title: "Deep Sleep Journey",
    description:
      "An immersive guided visualization that takes you on a peaceful journey to promote deep, restorative sleep. This premium meditation uses advanced binaural audio technology and a carefully crafted narrative to guide you into a state of deep relaxation and prepare your mind and body for high-quality sleep.",
    duration: 2400, // 40 minutes
    category: "sleep",
    level: "advanced",
    image_url: "/placeholder.svg?height=400&width=400&text=Sleep+Journey",
    audio_url: "/meditations/sleep-journey.mp3",
    is_premium: true,
    created_at: new Date().toISOString(),
  },
]

