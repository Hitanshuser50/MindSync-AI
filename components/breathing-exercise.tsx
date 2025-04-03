"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pause, Play, RefreshCw } from "lucide-react"

type BreathingExerciseProps = {
  title?: string
  duration?: number // in seconds
  inhaleTime?: number // in seconds
  holdTime?: number // in seconds
  exhaleTime?: number // in seconds
}

export default function BreathingExercise({
  title = "Box Breathing Exercise",
  duration = 120, // 2 minutes
  inhaleTime = 4,
  holdTime = 4,
  exhaleTime = 4,
}: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(inhaleTime)

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
                setCurrentPhase("hold2")
                return holdTime
              case "hold2":
                setCurrentPhase("inhale")
                return inhaleTime
            }
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, currentPhase, inhaleTime, holdTime, exhaleTime])

  const toggleExercise = () => {
    setIsActive(!isActive)
  }

  const resetExercise = () => {
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
    }
  }

  const getCircleSize = () => {
    switch (currentPhase) {
      case "inhale":
        return `scale-${1 + (inhaleTime - phaseTimeLeft) / inhaleTime}`
      case "hold1":
        return "scale-1"
      case "exhale":
        return `scale-${1 - (exhaleTime - phaseTimeLeft) / exhaleTime}`
      case "hold2":
        return "scale-0"
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center mb-4">
          <p className="text-lg font-medium">{getInstructions()}</p>
          <p className="text-sm text-muted-foreground mt-1">Time remaining: {formatTime(timeLeft)}</p>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
          <div
            className={`absolute w-40 h-40 bg-primary/20 rounded-full transition-transform duration-1000 ${
              isActive ? "breathing-animation" : ""
            }`}
          ></div>
          <div className="z-10 text-4xl font-bold">{phaseTimeLeft}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button onClick={toggleExercise} variant="outline" size="icon">
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button onClick={resetExercise} variant="outline" size="icon">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  )
}

