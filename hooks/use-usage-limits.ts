"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"

export function useUsageLimits(feature: string) {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const [usageCount, setUsageCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasReachedLimit, setHasReachedLimit] = useState<boolean>(false)

  // Always return unlimited usage
  useEffect(() => {
    setIsLoading(false)
    setHasReachedLimit(false)
  }, [user])

  // No-op increment function
  const incrementUsage = () => {
    return false
  }

  // Always return unlimited remaining usage
  const getRemainingUsage = () => {
    return Number.POSITIVE_INFINITY
  }

  return {
    usageCount,
    hasReachedLimit: false, // Always false
    isLoading,
    incrementUsage,
    resetUsage: () => {},
    getRemainingUsage,
    isAnonymous: !user,
    isPremium: true, // Always true
  }
}

