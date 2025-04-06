"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import {
  Play,
  Pause,
  SkipBack,
  Volume2,
  VolumeX,
  AlertCircle,
  Loader2,
  Sparkles,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react"
import { usePremium } from "@/hooks/use-premium"
import { useUsageLimits } from "@/hooks/use-usage-limits"
import UpgradePrompt from "@/components/upgrade-prompt"
import { audioFileExists } from "@/lib/audio-files"
import { motion } from "framer-motion"

interface GuidedMeditationProps {
  title: string
  description: string
  audioSrc: string
  duration: number
  isPremium?: boolean
  coverImage?: string
  category?: string
  allowDownload?: boolean
}

export default function GuidedMeditation({
  title,
  description,
  audioSrc,
  duration,
  isPremium = false,
  coverImage,
  category = "meditation",
  allowDownload = false,
}: GuidedMeditationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [visualizerValues, setVisualizerValues] = useState<number[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const { toast } = useToast()
  const { isPremium: hasPremium } = usePremium()

  // Add usage limits
  const { hasReachedLimit, incrementUsage, isAnonymous } = useUsageLimits("self-care")

  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [durationState, setDuration] = useState(duration || 0)

  // Check if this is a real audio file or a demo
  const hasRealAudio = audioFileExists(audioSrc)

  // Generate visualizer values
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        // Generate random values for the visualizer when playing
        const newValues = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
        setVisualizerValues(newValues)
      }, 200)

      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const updateProgress = () => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)
    animationRef.current = requestAnimationFrame(updateProgress)
  }

  useEffect(() => {
    // Skip audio loading if we know it's a demo file
    if (!hasRealAudio) {
      setAudioError(true)
      setIsLoading(false)
      return
    }

    // Create audio element
    const audio = new Audio()

    // Set up error handling
    const handleError = (e: Event) => {
      console.error("Audio failed to load:", audioSrc, e)
      setAudioError(true)
      setIsPlaying(false)
      setIsLoading(false)

      toast({
        title: "Audio failed to load",
        description: "We couldn't load the meditation audio. Please try again later.",
        variant: "destructive",
      })
    }

    // Set up load handling
    const handleCanPlay = () => {
      setAudioLoaded(true)
      setIsLoading(false)
      setAudioError(false)

      // If the audio has a duration, use it
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    // Set up event listeners
    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    // Add event listeners
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("loadstart", () => setIsLoading(true))

    // Set audio properties
    audio.volume = volume
    audio.preload = "metadata"
    audio.crossOrigin = "anonymous" // Add this to avoid CORS issues

    // Only set the src if we're in a browser environment and have a valid URL
    if (typeof window !== "undefined" && audioSrc && audioSrc.trim() !== "") {
      try {
        // Set the audio source
        audio.src = audioSrc
        audioRef.current = audio
      } catch (error) {
        console.error("Error setting audio source:", error)
        setAudioError(true)
        setIsLoading(false)
      }
    } else {
      // If no audio source, set error state
      setAudioError(true)
      setIsLoading(false)
    }

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause()
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("error", handleError)
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("loadstart", () => setIsLoading(true))
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioSrc, toast, hasRealAudio])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Save and restore playback position
  useEffect(() => {
    // Load saved position from localStorage when component mounts
    if (typeof window !== "undefined" && audioSrc) {
      const savedPosition = localStorage.getItem(`meditation-position-${audioSrc}`)
      if (savedPosition && audioRef.current) {
        const position = Number.parseFloat(savedPosition)
        if (!isNaN(position) && position > 0 && position < durationState - 30) {
          audioRef.current.currentTime = position
          setCurrentTime(position)
        }
      }
    }

    // Save position to localStorage when component unmounts
    return () => {
      if (typeof window !== "undefined" && audioSrc && currentTime > 0) {
        localStorage.setItem(`meditation-position-${audioSrc}`, currentTime.toString())
      }
    }
  }, [audioSrc, durationState])

  const togglePlayPause = () => {
    // Check for premium content
    if (isPremium && !hasPremium) {
      toast({
        title: "Premium Content",
        description: "This meditation is only available to premium subscribers.",
      })
      return
    }

    // Check for usage limits
    if (!hasPremium && hasReachedLimit && !isPlaying) {
      setShowLimitWarning(true)
      return
    }

    // If starting playback, increment usage
    if (!isPlaying && !hasPremium) {
      incrementUsage()
    }

    // If in demo mode or audio error, show a message
    if (audioError) {
      // For demo purposes, don't show an error toast, just log it
      if (!hasRealAudio) {
        console.log("Demo mode: Audio would play here if available")
        // Simulate playing for demo purposes
        setIsPlaying(!isPlaying)
        return
      }

      toast({
        title: "Audio Error",
        description: "We're having trouble playing this meditation. Please try again later.",
        variant: "destructive",
      })
      return
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      } else {
        // Use a promise to catch play errors
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              animationRef.current = requestAnimationFrame(updateProgress)
            })
            .catch((error) => {
              // Auto-play was prevented or another error occurred
              console.error("Error playing audio:", error)
              setAudioError(true)
              toast({
                title: "Playback Error",
                description: "We couldn't start playback. Please try again.",
                variant: "destructive",
              })
            })
        }
      }
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || audioError) return

    const newTime = value[0]
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }

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

  const resetAudio = () => {
    if (!audioRef.current || audioError) return

    audioRef.current.currentTime = 0
    setCurrentTime(0)
    if (!isPlaying) {
      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            animationRef.current = requestAnimationFrame(updateProgress)
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
            setAudioError(true)
            toast({
              title: "Playback Error",
              description: "We couldn't restart playback. Please try again.",
              variant: "destructive",
            })
          })
      }
    }
  }

  const handleDownload = async () => {
    if (!hasPremium) {
      toast({
        title: "Premium Feature",
        description: "Downloading meditations is available for premium users only.",
      })
      return
    }

    if (!hasRealAudio) {
      toast({
        title: "Cannot Download",
        description: "This meditation doesn't have an audio file available for download.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDownloading(true)

      // Fetch the audio file
      const response = await fetch(audioSrc)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.mp3`

      // Trigger the download
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Download Complete",
        description: "Your meditation has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error downloading audio:", error)
      toast({
        title: "Download Failed",
        description: "We couldn't download the meditation. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // If showing limit warning
  if (showLimitWarning) {
    return (
      <UpgradePrompt
        type={isAnonymous ? "anonymous" : "free"}
        feature="meditation sessions"
        onClose={() => setShowLimitWarning(false)}
      />
    )
  }

  // Demo mode content - used when audio files aren't available
  const demoContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-md">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <p className="text-sm">This is a text-based meditation guide. Follow along at your own pace.</p>
      </div>

      <div className="space-y-4">
        <p className="text-sm">1. Find a comfortable position and close your eyes.</p>
        <p className="text-sm">2. Take a deep breath in through your nose for 4 counts.</p>
        <p className="text-sm">3. Hold your breath for 4 counts.</p>
        <p className="text-sm">4. Exhale slowly through your mouth for 6 counts.</p>
        <p className="text-sm">5. Repeat this breathing pattern for the duration of the meditation.</p>
        <p className="text-sm">6. Focus on the sensation of your breath entering and leaving your body.</p>
        <p className="text-sm">7. When your mind wanders, gently bring your attention back to your breath.</p>
      </div>
    </div>
  )

  // Audio visualizer component
  const AudioVisualizer = () => (
    <div className="flex items-end justify-center h-16 gap-1 my-4">
      {visualizerValues.map((value, index) => (
        <motion.div
          key={index}
          className="w-2 bg-primary rounded-t"
          initial={{ height: 4 }}
          animate={{
            height: isPlaying ? Math.max(4, value / 3) : 4,
            opacity: isPlaying ? 0.7 : 0.3,
          }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  )

  const content = (
    <Card className="overflow-hidden">
      {coverImage && (
        <div className="relative w-full h-40">
          <img src={coverImage || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
          {isPremium && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {category && (
            <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading meditation...</p>
          </div>
        ) : audioError ? (
          <>
            {demoContent}
            {isPlaying && <AudioVisualizer />}
          </>
        ) : (
          <>
            <AudioVisualizer />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(durationState)}</span>
              </div>
              <Slider
                value={[currentTime]}
                max={durationState}
                step={0.1}
                onValueChange={handleSeek}
                aria-label="Seek time"
                disabled={isPremium && !hasPremium}
              />
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" onClick={resetAudio} disabled={isPremium && !hasPremium}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant={isPremium && !hasPremium ? "outline" : "default"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={togglePlayPause}
                disabled={isPremium && !hasPremium}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              {allowDownload && hasPremium && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  disabled={isDownloading || !hasRealAudio}
                >
                  {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleMute}
                disabled={isPremium && !hasPremium}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                aria-label="Volume"
                className="w-32"
                disabled={isPremium && !hasPremium}
              />
            </div>
          </>
        )}

        {/* Session timer */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Session duration: {formatTime(durationState)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isPremium && !hasPremium ? (
          <Button className="w-full gap-2" onClick={() => (window.location.href = "/subscription")}>
            <Sparkles className="h-4 w-4" />
            Unlock with Premium
          </Button>
        ) : (
          <>
            <div className="text-xs text-muted-foreground flex-1 text-center">
              Find a quiet place and get comfortable. Focus on your breathing as you listen.
            </div>
            {currentTime > 0 && currentTime < durationState - 10 && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-xs"
                onClick={() => {
                  localStorage.removeItem(`meditation-position-${audioSrc}`)
                  setCurrentTime(0)
                  if (audioRef.current) audioRef.current.currentTime = 0
                }}
              >
                <RefreshCw className="h-3 w-3" />
                Reset progress
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  )

  return content
}

