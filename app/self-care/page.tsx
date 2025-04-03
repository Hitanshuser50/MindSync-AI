"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { BookOpen, Wind, Leaf } from "lucide-react"
import GuidedMeditation from "@/components/guided-meditation"

type Resource = {
  id: string
  title: string
  description: string
  content: string
  category: string
  image_url: string | null
}

export default function SelfCarePage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load self-care resources.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If no resources in the database, use these placeholders
  const placeholderResources: Resource[] = [
    {
      id: "1",
      title: "5-Minute Breathing Exercise",
      description: "A quick breathing technique to reduce anxiety and stress.",
      content: "Find a comfortable position and follow these steps...",
      category: "breathing",
      image_url: null,
    },
    {
      id: "2",
      title: "Progressive Muscle Relaxation",
      description: "Release tension in your body with this guided exercise.",
      content: "Start by tensing and then relaxing each muscle group...",
      category: "meditation",
      image_url: null,
    },
    {
      id: "3",
      title: "Understanding Anxiety",
      description: "Learn about the causes and management of anxiety.",
      content: "Anxiety is a natural response to stress...",
      category: "articles",
      image_url: null,
    },
    {
      id: "4",
      title: "Mindful Walking Practice",
      description: "Connect with your surroundings through mindful walking.",
      content: "Begin by standing still and becoming aware of your body...",
      category: "meditation",
      image_url: null,
    },
    {
      id: "5",
      title: "Box Breathing Technique",
      description: "A simple breathing pattern to calm your nervous system.",
      content: "Inhale for 4 counts, hold for 4 counts...",
      category: "breathing",
      image_url: null,
    },
    {
      id: "6",
      title: "Building Healthy Sleep Habits",
      description: "Tips for improving your sleep quality and routine.",
      content: "Consistent sleep schedules help regulate your body's clock...",
      category: "articles",
      image_url: null,
    },
  ]

  // Guided meditation data - using empty strings for audioSrc to trigger the demo mode
  const guidedMeditations = [
    {
      id: "med1",
      title: "Calming Anxiety Meditation",
      description: "A 10-minute guided meditation to help reduce anxiety and find calm",
      audioSrc: "", // Empty string will trigger demo mode
      duration: 600, // 10 minutes in seconds
      isPremium: false,
    },
    {
      id: "med2",
      title: "Deep Sleep Meditation",
      description: "A soothing meditation to help you fall into a restful sleep",
      audioSrc: "", // Empty string will trigger demo mode
      duration: 1200, // 20 minutes in seconds
      isPremium: true,
    },
    {
      id: "med3",
      title: "Morning Energy Meditation",
      description: "Start your day with clarity and positive energy",
      audioSrc: "", // Empty string will trigger demo mode
      duration: 300, // 5 minutes in seconds
      isPremium: true,
    },
  ]

  const displayResources = resources.length > 0 ? resources : placeholderResources

  const filteredResources =
    activeCategory === "all"
      ? displayResources
      : displayResources.filter((resource) => resource.category === activeCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meditation":
        return <Leaf className="h-5 w-5" />
      case "breathing":
        return <Wind className="h-5 w-5" />
      case "articles":
        return <BookOpen className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Self-Care Library</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of guided meditations, breathing exercises, and articles to support your mental
            wellbeing journey.
          </p>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActiveCategory("all")}>
                All Resources
              </TabsTrigger>
              <TabsTrigger value="meditation" onClick={() => setActiveCategory("meditation")}>
                Meditation
              </TabsTrigger>
              <TabsTrigger value="breathing" onClick={() => setActiveCategory("breathing")}>
                Breathing
              </TabsTrigger>
              <TabsTrigger value="articles" onClick={() => setActiveCategory("articles")}>
                Articles
              </TabsTrigger>
              <TabsTrigger value="guided">Guided Meditations</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="meditation" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="breathing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guided" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidedMeditations.map((meditation) => (
                <div key={meditation.id} className="h-full">
                  <GuidedMeditation
                    title={meditation.title}
                    description={meditation.description}
                    audioSrc={meditation.audioSrc}
                    duration={meditation.duration}
                    isPremium={meditation.isPremium}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          {resource.category === "meditation" ? (
            <Leaf className="h-5 w-5 text-primary" />
          ) : resource.category === "breathing" ? (
            <Wind className="h-5 w-5 text-primary" />
          ) : (
            <BookOpen className="h-5 w-5 text-primary" />
          )}
          <span className="text-xs text-muted-foreground capitalize">{resource.category}</span>
        </div>
        <CardTitle>{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{resource.content}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/self-care/${resource.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Read More
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

