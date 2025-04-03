"use client"

import { type ReactNode, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { usePremium } from "@/hooks/use-premium"
import { Sparkles, Lock } from "lucide-react"

interface PremiumFeatureProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function PremiumFeature({ children, fallback }: PremiumFeatureProps) {
  const { isPremium, isLoading } = usePremium()
  const [hasError, setHasError] = useState(false)

  // If there's an error with the premium check or it's taking too long,
  // we'll show the content anyway to prevent blocking the UI
  if (hasError) {
    return <>{children}</>
  }

  // Set a timeout to handle cases where the premium check is taking too long
  if (isLoading) {
    // Set a timeout to prevent blocking the UI if the check takes too long
    setTimeout(() => {
      if (isLoading) {
        setHasError(true)
      }
    }, 3000) // 3 seconds timeout

    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isPremium) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Premium Feature</h3>
          <p className="text-muted-foreground mb-4">This feature is available exclusively to premium subscribers.</p>
          <Link href="/subscription">
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

