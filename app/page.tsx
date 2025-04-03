"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { MessageCircle, BarChart2, BookOpen, Phone, ArrowRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import NewsletterSignup from "@/components/newsletter-signup"

export default function HomePage() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Your Mental Wellbeing Companion
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Find peace, track your mood, and access supportive resources on your journey to better mental health.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/chat">
                <Button size="lg" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Start Chatting
                </Button>
              </Link>
              {!user && (
                <Link href="/signup">
                  <Button variant="outline" size="lg">
                    Create Account
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Features Designed for Your Wellbeing
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground">
                Explore our comprehensive tools to support your mental health journey.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10 text-primary" />}
              title="AI Chat Support"
              description="Talk to our empathetic AI assistant anytime you need emotional support or guidance."
              link="/chat"
              delay={0.1}
            />
            <FeatureCard
              icon={<BarChart2 className="h-10 w-10 text-primary" />}
              title="Mood Tracking"
              description="Track your emotional patterns over time to gain insights into your mental wellbeing."
              link="/mood"
              delay={0.2}
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-primary" />}
              title="Self-Care Library"
              description="Access guided meditations, breathing exercises, and articles to support your journey."
              link="/self-care"
              delay={0.3}
            />
            <FeatureCard
              icon={<Phone className="h-10 w-10 text-primary" />}
              title="Crisis Resources"
              description="Find immediate help and support resources during difficult moments."
              link="/emergency"
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2 space-y-4"
            >
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Premium Features</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Unlock Advanced Mental Health Support
              </h2>
              <p className="text-muted-foreground">
                Upgrade to premium for unlimited AI therapy sessions, personalized insights, and exclusive guided
                meditations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/subscription">
                  <Button className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline">View Plans</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="grid gap-4">
                    <PremiumFeatureItem
                      title="Unlimited AI Therapy Sessions"
                      description="No limits on your conversations with our AI therapist."
                    />
                    <PremiumFeatureItem
                      title="Personalized Mental Health Insights"
                      description="Receive custom reports and trends based on your mood tracking data."
                    />
                    <PremiumFeatureItem
                      title="Exclusive Guided Meditations"
                      description="Access our premium library of specialized meditation content."
                    />
                    <PremiumFeatureItem
                      title="Priority Support"
                      description="Get faster responses and dedicated assistance when you need it."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <NewsletterSignup
              title="Join Our Mindful Community"
              description="Subscribe to receive monthly mental health tips, new meditation releases, and exclusive content directly to your inbox."
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
                Start Your Mental Wellbeing Journey Today
              </h2>
              <p className="mx-auto max-w-[700px] opacity-90">
                Join thousands of users who have found support, peace, and growth with our platform.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href={user ? "/chat" : "/signup"}>
                <Button size="lg" variant="secondary" className="gap-2">
                  {user ? "Start Chatting" : "Create Free Account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description, link, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Link href={link}>
        <Card className="h-full transition-all hover:shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="p-3 rounded-full bg-primary/10">{icon}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            <div className="flex items-center text-primary">
              <span className="text-sm font-medium">Learn more</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

function PremiumFeatureItem({ title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="rounded-full bg-primary/10 p-1.5 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

