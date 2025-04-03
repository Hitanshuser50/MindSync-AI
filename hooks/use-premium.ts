"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"

export function usePremium() {
  const [isPremium, setIsPremium] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setIsLoading(false)
      return
    }

    const checkPremiumStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/subscription")

        // Check if the response is OK before trying to parse JSON
        if (!response.ok) {
          console.error(`Subscription API returned status: ${response.status}`)
          setIsPremium(false)
          return
        }

        // Try to parse the JSON response
        try {
          const data = await response.json()

          setIsPremium(
            data.subscription &&
              data.subscription.plan_type !== "free" &&
              data.subscription.status === "active" &&
              !data.subscription.cancel_at_period_end,
          )
        } catch (parseError) {
          console.error("Error parsing subscription response:", parseError)
          setIsPremium(false)
        }
      } catch (error) {
        console.error("Error checking premium status:", error)
        setIsPremium(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPremiumStatus()
  }, [user])

  return { isPremium, isLoading }
}

