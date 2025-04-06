"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Pause, Play, RefreshCw, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { usePremium } from "@/hooks/use-premium"
import { useUsageLimits } from "@/hooks/use-usage-limits"
import UpgradePrompt from "@/components/upgrade-prompt"

type BreathingExerciseProps = {
  title?: string
  description?: string
  duration?: number // in seconds
  inhaleTime?: number // in seconds
  holdTime?: number // in seconds
  exhaleTime?: number // in seconds
  holdAfterExhaleTime?: number // in seconds
  isPremium?: boolean
  type?: "box" | "4-7-8" | "relaxing" | "energizing"
}

export default function BreathingExercise({
  title,
  description,
  duration = 120, // 2 minutes
  inhaleTime = 4,
  holdTime = 4,
  exhaleTime = 4,
  holdAfterExhaleTime = 0,
  isPremium = false,
  type = "box",
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(inhaleTime)
  const [showInfo, setShowInfo] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { isPremium: hasPremium } = usePremium()

  // Add usage limits
  const { hasReachedLimit, incrementUsage, isAnonymous } = useUsageLimits("self-care")

  const [showLimitWarning, setShowLimitWarning] = useState(false)

  // Set exercise parameters based on type
  useEffect(() => {
    switch (type) {
      case "box":
        // Already set as defaults
        break
      case "4-7-8":
        inhaleTime = 4
        holdTime = 7
        exhaleTime = 8
        holdAfterExhaleTime = 0
        break
      case "relaxing":
        inhaleTime = 4
        holdTime = 2
        exhaleTime = 6
        holdAfterExhaleTime = 2
        break
      case "energizing":
        inhaleTime = 2
        holdTime = 0
        exhaleTime = 2
        holdAfterExhaleTime = 0
        break
    }
  }, [type])

  // Set title and description based on type if not provided
  const exerciseTitle =
    title ||
    (type === "box"
      ? "Box Breathing Exercise"
      : type === "4-7-8"
        ? "4-7-8 Breathing Technique"
        : type === "relaxing"
          ? "Relaxing Breath"
          : "Energizing Breath")

  const exerciseDescription =
    description ||
    (type === "box"
      ? "Breathe in, hold, breathe out, and hold for equal counts"
      : type === "4-7-8"
        ? "Inhale for 4, hold for 7, exhale for 8"
        : type === "relaxing"
          ? "A calming breath pattern to reduce stress"
          : "Quick breaths to increase energy and alertness")

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
        setPhaseTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Move to next phase
            switch (currentPhase) {
              case "inhale":
                setCurrentPhase("hold1")
                return holdTime
              case "hold1":
                setCurrentPhase("exhale")
                return exhaleTime
              case "exhale":
                if (holdAfterExhaleTime > 0) {
                  setCurrentPhase("hold2")
                  return holdAfterExhaleTime
                } else {
                  setCurrentPhase("inhale")
                  return inhaleTime
                }
              case "hold2":
                setCurrentPhase("inhale")
                return inhaleTime
              default:
                return prevTime
            }
          }
          return prevTime - 1
        })
      }, 1000)

      intervalRef.current = interval
    } else if (timeLeft === 0) {
      setIsActive(false)
      toast({
        title: "Exercise Complete",
        description: "Great job! You've completed your breathing exercise.",
      })
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, currentPhase, inhaleTime, holdTime, exhaleTime, holdAfterExhaleTime, toast])

  const toggleExercise = () => {
    // Check for premium content
    if (isPremium && !hasPremium) {
      toast({
        title: "Premium Content",
        description: "This breathing exercise is only available to premium subscribers.",
      })
      return
    }

    // Check for usage limits
    if (!hasPremium && hasReachedLimit && !isActive) {
      setShowLimitWarning(true)
      return
    }

    // If starting exercise, increment usage
    if (!isActive && !hasPremium) {
      incrementUsage()
    }

    setIsActive(!isActive)
  }

  const resetExercise = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsActive(false)
    setTimeLeft(duration)
    setCurrentPhase("inhale")
    setPhaseTimeLeft(inhaleTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getInstructions = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inhale slowly through your nose"
      case "hold1":
        return "Hold your breath"
      case "exhale":
        return "Exhale slowly through your mouth"
      case "hold2":
        return "Hold your breath"
      default:
        return "Prepare to begin"
    }
  }

  // If showing limit warning
  if (showLimitWarning) {
    return (
      <UpgradePrompt
        type={isAnonymous ? "anonymous" : "free"}
        feature="breathing exercises"
        onClose={() => setShowLimitWarning(false)}
      />
    )
  }

  // If premium content but user is not premium
  if (isPremium && !hasPremium) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <CardTitle>{exerciseTitle}</CardTitle>
          <CardDescription>{exerciseDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Premium Breathing Exercise</p>
            <p className="text-sm text-muted-foreground mb-6">
              Upgrade to premium to access this and other advanced breathing techniques
            </p>
            <Button onClick={() => (window.location.href = "/subscription")}>Upgrade to Premium</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{exerciseTitle}</CardTitle>
            <CardDescription>{exerciseDescription}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)} title="Exercise Information">
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full mb-4 p-4 bg-muted rounded-md"
            >
              <h4 className="font-medium mb-2">About this exercise</h4>
              {type === "box" && (
                <p className="text-sm text-muted-foreground">
                  Box breathing, also known as square breathing, is a powerful stress-relieving technique. It involves
                  breathing in, holding, breathing out, and holding again for equal counts, creating a "box" pattern
                  that helps calm the nervous system.
                </p>
              )}
              {type === "4-7-8" && (
                <p className="text-sm text-muted-foreground">
                  The 4-7-8 breathing technique is a breathing pattern developed by Dr. Andrew Weil. It involves
                  inhaling for 4 counts, holding for 7 counts, and exhaling for 8 counts. This technique acts as a
                  natural tranquilizer for the nervous system.
                </p>
              )}
              {type === "relaxing" && (
                <p className="text-sm text-muted-foreground">
                  This relaxing breath pattern emphasizes longer exhales than inhales, which helps activate the
                  parasympathetic nervous system, reducing stress and anxiety. The extended exhale promotes a deeper
                  state of relaxation.
                </p>
              )}
              {type === "energizing" && (
                <p className="text-sm text-muted-foreground">
                  Energizing breath uses quick, rhythmic breathing to increase alertness and energy. Unlike relaxing
                  techniques, this pattern stimulates the sympathetic nervous system to help you feel more awake and
                  focused.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-4">
          <p className="text-lg font-medium">{getInstructions()}</p>
          <p className="text-sm text-muted-foreground mt-1">Time remaining: {formatTime(timeLeft)}</p>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPhase}
              initial={{ scale: currentPhase === "inhale" ? 0.8 : 1.2, opacity: 0.5 }}
              animate={{
                scale: currentPhase === "inhale" ? 1.2 : currentPhase === "exhale" ? 0.8 : 1,
                opacity: 0.8,
              }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{
                duration:
                  currentPhase === "inhale"
                    ? inhaleTime
                    : currentPhase === "exhale"
                      ? exhaleTime
                      : currentPhase === "hold1" || currentPhase === "hold2"
                        ? 0.5
                        : 1,
                ease: "easeInOut",
              }}
              className="absolute w-40 h-40 bg-primary/20 rounded-full"
            />
          </AnimatePresence>
          <div className="z-10 text-4xl font-bold">{phaseTimeLeft}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button onClick={toggleExercise} variant="outline" size="icon" className="h-12 w-12 rounded-full">
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <Button onClick={resetExercise} variant="outline" size="icon" className="h-12 w-12 rounded-full">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

