"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, Volume2, AlertCircle } from "lucide-react"
import { usePremium } from "@/hooks/use-premium"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PremiumFeature from "@/components/premium-feature"

interface GuidedMeditationProps {
  title: string
  description: string
  audioSrc: string
  duration: number
  isPremium?: boolean
}

export default function GuidedMeditation({
  title,
  description,
  audioSrc,
  duration,
  isPremium = false,
}: GuidedMeditationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { isPremium: hasPremium } = usePremium()

  useEffect(() => {
    // Create audio element
    const audio = new Audio()

    // Set up error handling
    const handleError = () => {
      console.error("Audio failed to load:", audioSrc)
      setAudioError(true)
      setIsPlaying(false)
    }

    // Set up event listeners
    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    // Add event listeners
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    // Set audio properties
    audio.volume = volume

    // Only set the src if we're in a browser environment
    if (typeof window !== "undefined") {
      try {
        audio.src = audioSrc
        audioRef.current = audio
      } catch (error) {
        console.error("Error setting audio source:", error)
        setAudioError(true)
      }
    }

    // Cleanup function
    return () => {
      if (audio) {
        audio.pause()
        audio.removeEventListener("timeupdate", updateTime)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("error", handleError)
      }
    }
  }, [audioSrc])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlayPause = () => {
    if (audioError) {
      return
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        // Use a promise to catch play errors
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
            })
            .catch((error) => {
              // Auto-play was prevented or another error occurred
              console.error("Error playing audio:", error)
              setAudioError(true)
            })
        }
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && !audioError) {
      const newTime = value[0]
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const resetAudio = () => {
    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      if (!isPlaying) {
        const playPromise = audioRef.current.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
            })
            .catch((error) => {
              console.error("Error playing audio:", error)
              setAudioError(true)
            })
        }
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Demo mode content - used when audio files aren't available
  const demoContent = (
    <div className="space-y-4">
      <Alert variant="default" className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>This is a demo meditation. Audio playback is simulated.</AlertDescription>
      </Alert>

      <div className="space-y-4">
        <p className="text-sm">1. Find a comfortable position and close your eyes.</p>
        <p className="text-sm">2. Take a deep breath in through your nose for 4 counts.</p>
        <p className="text-sm">3. Hold your breath for 4 counts.</p>
        <p className="text-sm">4. Exhale slowly through your mouth for 6 counts.</p>
        <p className="text-sm">5. Repeat this breathing pattern for the duration of the meditation.</p>
      </div>
    </div>
  )

  const content = (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {audioError ? (
          demoContent
        ) : (
          <>
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
              />
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon" onClick={resetAudio}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider value={[volume]} max={1} step={0.01} onValueChange={handleVolumeChange} aria-label="Volume" />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Find a quiet place and get comfortable. Focus on your breathing as you listen.
        </div>
      </CardFooter>
    </Card>
  )

  if (isPremium && !hasPremium) {
    return <PremiumFeature>{content}</PremiumFeature>
  }

  return content
}

