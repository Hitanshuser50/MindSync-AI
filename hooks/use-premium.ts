"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export function usePremium() {
  const [isPremium, setIsPremium] = useState<boolean>(true) // Always return true
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAuth()

  // No need to check premium status anymore
  useEffect(() => {
    setIsPremium(true)
    setIsLoading(false)
  }, [user])

  return { isPremium, isLoading }
}

