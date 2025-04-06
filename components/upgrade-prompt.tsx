"use client"

import { useState } from "react"

interface UpgradePromptProps {
  type: "anonymous" | "free"
  feature: string
  onClose?: () => void
}

// This component is now a no-op since all features are free
export default function UpgradePrompt({ type, feature, onClose }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(false) // Start with not visible

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) onClose()
  }

  // Return null to render nothing
  return null
}

