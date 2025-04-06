"use client"

import type { ReactNode } from "react"

interface PremiumFeatureProps {
  children: ReactNode
  fallback?: ReactNode
}

// This component now just renders children directly since all features are free
export default function PremiumFeature({ children, fallback }: PremiumFeatureProps) {
  // Always render the children
  return <>{children}</>
}

