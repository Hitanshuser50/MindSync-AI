"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Mail, CheckCircle, Loader2 } from "lucide-react"

interface NewsletterSignupProps {
  title?: string
  description?: string
  className?: string
  variant?: "default" | "inline" | "card"
}

export default function NewsletterSignup({
  title = "Subscribe to Our Newsletter",
  description = "Get the latest mental health tips, resources, and updates delivered to your inbox monthly.",
  className = "",
  variant = "default",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would call your API to save the email
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSuccess(true)
      setEmail("")

      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      })

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error subscribing to newsletter:", error)

      toast({
        title: "Subscription failed",
        description: "Failed to subscribe to the newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === "inline") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading || isSuccess}
            />
          </div>
          <Button type="submit" disabled={isLoading || isSuccess}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>
      </div>
    )
  }

  if (variant === "card") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading || isSuccess}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <div className={`bg-muted/50 p-6 rounded-lg ${className}`}>
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={isLoading || isSuccess}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Subscribed!
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">We respect your privacy. Unsubscribe at any time.</p>
        </form>
      </div>
    </div>
  )
}

