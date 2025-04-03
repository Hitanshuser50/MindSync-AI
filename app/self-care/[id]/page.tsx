"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, BookOpen, Wind, Leaf } from "lucide-react"
import BreathingExercise from "@/components/breathing-exercise"

type Resource = {
  id: string
  title: string
  description: string
  content: string
  category: string
  image_url: string | null
}

export default function ResourcePage() {
  const { id } = useParams()
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      // Try to fetch from database first
      const { data, error } = await supabase.from("resources").select("*").eq("id", id).single()

      if (error) {
        // If not found in database, use placeholder
        const placeholder = placeholderResources.find((r) => r.id === id)
        if (placeholder) {
          setResource(placeholder)
        } else {
          throw new Error("Resource not found")
        }
      } else {
        setResource(data)
      }
    } catch (error) {
      console.error("Error fetching resource:", error)
      toast({
        title: "Error",
        description: "Failed to load the resource.",
        variant: "destructive",
      })
      router.push("/self-care")
    } finally {
      setIsLoading(false)
    }
  }

  // Placeholder resources if none in database
  const placeholderResources: Resource[] = [
    {
      id: "1",
      title: "5-Minute Breathing Exercise",
      description: "A quick breathing technique to reduce anxiety and stress.",
      content:
        "Find a comfortable position and follow these steps for a 5-minute breathing exercise that can help reduce anxiety and stress. This exercise can be done anywhere, anytime you need to center yourself and find calm.\n\nBox breathing, also known as square breathing, is a simple technique that can help you return to calm when you're feeling stressed or anxious. It involves breathing in, holding your breath, breathing out, and holding for equal counts.",
      category: "breathing",
      image_url: null,
    },
    {
      id: "2",
      title: "Progressive Muscle Relaxation",
      description: "Release tension in your body with this guided exercise.",
      content:
        "Progressive Muscle Relaxation (PMR) is a deep relaxation technique that has been effectively used to control stress and anxiety, relieve insomnia, and reduce symptoms of certain types of chronic pain.\n\nThe technique involves tensing specific muscle groups and then relaxing them to create awareness of tension and relaxation. It's a simple practice that can help you become more aware of physical sensations.\n\nStart by tensing each muscle group for about 5 seconds, then suddenly release the tension and notice the feeling of relaxation for about 15 seconds. Repeat this process for all major muscle groups, working from your feet up to your face.",
      category: "meditation",
      image_url: null,
    },
    {
      id: "3",
      title: "Understanding Anxiety",
      description: "Learn about the causes and management of anxiety.",
      content:
        "Anxiety is a natural response to stress and can be beneficial in some situations. It can alert us to dangers and help us prepare and pay attention. However, anxiety disorders involve more than temporary worry or fear. For a person with an anxiety disorder, the anxiety does not go away and can get worse over time.\n\nCommon symptoms of anxiety include:\n- Feeling restless, wound-up, or on-edge\n- Being easily fatigued\n- Having difficulty concentrating\n- Being irritable\n- Having headaches, muscle aches, stomachaches, or unexplained pains\n- Difficulty controlling feelings of worry\n- Having sleep problems, such as difficulty falling or staying asleep\n\nAnxiety disorders are generally treated with psychotherapy, medication, or both. There are many ways to treat anxiety and people should work with their doctor to choose the treatment that is best for them.",
      category: "articles",
      image_url: null,
    },
  ]

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Resource Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The resource you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/self-care")}>Back to Self-Care Library</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/self-care")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Self-Care Library
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {resource.category === "meditation" ? (
                <Leaf className="h-5 w-5 text-primary" />
              ) : resource.category === "breathing" ? (
                <Wind className="h-5 w-5 text-primary" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary" />
              )}
              <span className="text-sm text-muted-foreground capitalize">{resource.category}</span>
            </div>
            <CardTitle className="text-2xl">{resource.title}</CardTitle>
            <CardDescription>{resource.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {resource.category === "breathing" ? (
              <div className="space-y-8">
                <div className="prose dark:prose-invert max-w-none">
                  <p>{resource.content}</p>
                </div>
                <div className="mt-8">
                  <BreathingExercise />
                </div>
              </div>
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                {resource.content.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/self-care")}>
              Back to Self-Care Library
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

