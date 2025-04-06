"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, BookOpen, Wind, Leaf, Brain, Moon, Sun, Clock, Sparkles } from "lucide-react"
import BreathingExercise from "@/components/breathing-exercise"
import GuidedMeditation from "@/components/guided-meditation"
import { usePremium } from "@/hooks/use-premium"
import { motion } from "framer-motion"

// Import the usage limits hook
import { useUsageLimits } from "@/hooks/use-usage-limits"
import UpgradePrompt from "@/components/upgrade-prompt"

type Resource = {
  id: string
  title: string
  description: string
  content: string
  category: string
  subcategory?: string
  difficulty?: string
  duration?: number
  image_url: string | null
  is_premium?: boolean
}

export default function ResourcePage() {
  const { id } = useParams()
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [relatedResources, setRelatedResources] = useState<Resource[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { isPremium } = usePremium()

  // Add the usage limits hook
  const { hasReachedLimit, isAnonymous } = useUsageLimits("self-care")

  // Add state to track if we should show the limit warning
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      setIsLoading(true)

      // Try to fetch from database first
      const { data, error } = await supabase.from("resources").select("*").eq("id", id).single()

      if (error) {
        // If not found in database, use placeholder
        const placeholder = enhancedPlaceholderResources.find((r) => r.id === id)
        if (placeholder) {
          setResource(placeholder)

          // Get related resources
          const related = enhancedPlaceholderResources
            .filter(
              (r) => r.id !== id && (r.category === placeholder.category || r.subcategory === placeholder.subcategory),
            )
            .slice(0, 3)
          setRelatedResources(related)
        } else {
          throw new Error("Resource not found")
        }
      } else {
        setResource(data)

        // Get related resources from database
        const { data: relatedData } = await supabase
          .from("resources")
          .select("*")
          .neq("id", id)
          .eq("category", data.category)
          .limit(3)

        setRelatedResources(relatedData || [])
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

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meditation":
        return <Leaf className="h-5 w-5 text-primary" />
      case "breathing":
        return <Wind className="h-5 w-5 text-primary" />
      case "articles":
        return <BookOpen className="h-5 w-5 text-primary" />
      case "sleep":
        return <Moon className="h-5 w-5 text-primary" />
      case "mindfulness":
        return <Brain className="h-5 w-5 text-primary" />
      case "morning":
        return <Sun className="h-5 w-5 text-primary" />
      default:
        return <BookOpen className="h-5 w-5 text-primary" />
    }
  }

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

  // If premium content but user is not premium
  if (resource.is_premium && !isPremium) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/self-care")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Self-Care Library
          </Button>

          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(resource.category)}
                <span className="text-sm text-muted-foreground capitalize">{resource.category}</span>
                {resource.subcategory && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground capitalize">{resource.subcategory}</span>
                  </>
                )}
              </div>
              <CardTitle className="text-2xl">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-40 w-full overflow-hidden rounded-md">
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                    <p className="text-white/80 mb-4">Upgrade to access this premium resource</p>
                    <Button onClick={() => router.push("/subscription")}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
                <img
                  src={resource.image_url || `/placeholder.svg?height=150&width=400&text=${resource.category}`}
                  alt={resource.title}
                  className="w-full h-full object-cover blur-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If free user has reached limit
  if (hasReachedLimit && !isPremium) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/self-care")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Self-Care Library
          </Button>

          <UpgradePrompt
            type={isAnonymous ? "anonymous" : "free"}
            feature="self-care resources"
            onClose={() => router.push("/self-care")}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/self-care")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Self-Care Library
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <div className="relative w-full h-48 md:h-64">
              <img
                src={resource.image_url || `/placeholder.svg?height=200&width=800&text=${resource.category}`}
                alt={resource.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(resource.category)}
                <span className="text-sm text-muted-foreground capitalize">{resource.category}</span>
                {resource.subcategory && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground capitalize">{resource.subcategory}</span>
                  </>
                )}
                {resource.duration && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resource.duration} min
                    </span>
                  </>
                )}
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
              ) : resource.category === "meditation" ? (
                <div className="space-y-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{resource.content}</p>
                  </div>
                  <div className="mt-8">
                    <GuidedMeditation
                      title={`${resource.title} Meditation`}
                      description="Follow along with this guided practice"
                      audioSrc={`/meditations/${resource.id}.mp3`}
                      duration={resource.duration ? resource.duration * 60 : 600}
                      coverImage={resource.image_url || `/placeholder.svg?height=200&width=400&text=${resource.title}`}
                    />
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
        </motion.div>

        {relatedResources.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedResources.map((related, index) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className="h-full flex flex-col transition-all hover:shadow-md cursor-pointer"
                    onClick={() => router.push(`/self-care/${related.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(related.category)}
                        <span className="text-xs text-muted-foreground capitalize">{related.category}</span>
                      </div>
                      <CardTitle className="text-lg">{related.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2">{related.description}</p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="outline" className="w-full">
                        View Resource
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced placeholder resources with more categories and metadata
const enhancedPlaceholderResources = [
  {
    id: "1",
    title: "5-Minute Breathing Exercise",
    description: "A quick breathing technique to reduce anxiety and stress.",
    content:
      "Find a comfortable position and follow these steps for a 5-minute breathing exercise that can help reduce anxiety and stress. This exercise can be done anywhere, anytime you need to center yourself and find calm.\n\nBox breathing, also known as square breathing, is a simple technique that can help you return to calm when you're feeling stressed or anxious. It involves breathing in, holding your breath, breathing out, and holding for equal counts.",
    category: "breathing",
    subcategory: "anxiety",
    difficulty: "beginner",
    duration: 5,
    image_url: "/placeholder.svg?height=150&width=400&text=Breathing+Exercise",
    is_premium: false,
  },
  {
    id: "2",
    title: "Progressive Muscle Relaxation",
    description: "Release tension in your body with this guided exercise.",
    content:
      "Progressive Muscle Relaxation (PMR) is a deep relaxation technique that has been effectively used to control stress and anxiety, relieve insomnia, and reduce symptoms of certain types of chronic pain.\n\nThe technique involves tensing specific muscle groups and then relaxing them to create awareness of tension and relaxation. It's a simple practice that can help you become more aware of physical sensations.\n\nStart by tensing each muscle group for about 5 seconds, then suddenly release the tension and notice the feeling of relaxation for about 15 seconds. Repeat this process for all major muscle groups, working from your feet up to your face.",
    category: "meditation",
    subcategory: "relaxation",
    difficulty: "beginner",
    duration: 10,
    image_url: "/placeholder.svg?height=150&width=400&text=Muscle+Relaxation",
    is_premium: false,
  },
  {
    id: "3",
    title: "Understanding Anxiety",
    description: "Learn about the causes and management of anxiety.",
    content:
      "Anxiety is a natural response to stress and can be beneficial in some situations. It can alert us to dangers and help us prepare and pay attention. However, anxiety disorders involve more than temporary worry or fear. For a person with an anxiety disorder, the anxiety does not go away and can get worse over time.\n\nCommon symptoms of anxiety include:\n- Feeling restless, wound-up, or on-edge\n- Being easily fatigued\n- Having difficulty concentrating\n- Being irritable\n- Having headaches, muscle aches, stomachaches, or unexplained pains\n- Difficulty controlling feelings of worry\n- Having sleep problems, such as difficulty falling or staying asleep\n\nAnxiety disorders are generally treated with psychotherapy, medication, or both. There are many ways to treat anxiety and people should work with their doctor to choose the treatment that is best for them.",
    category: "articles",
    subcategory: "mental health",
    image_url: "/placeholder.svg?height=150&width=400&text=Anxiety+Article",
    is_premium: false,
  },
  {
    id: "4",
    title: "Body Scan Meditation",
    description: "A guided practice to connect with your body and release tension.",
    content:
      "The body scan meditation is a practice that involves systematically bringing attention to different parts of your body, from your toes to the top of your head. This practice helps develop awareness of bodily sensations, reduce physical tension, and connect with your body in the present moment.\n\nFind a comfortable position lying down or sitting. Close your eyes and take a few deep breaths. Begin by bringing your attention to your feet. Notice any sensations - warmth, coolness, tingling, pressure, or perhaps no sensation at all. There's no need to judge or change anything, simply observe. Gradually move your attention up through your body - ankles, calves, knees, thighs, and so on - spending about 20-30 seconds with each area.",
    category: "meditation",
    subcategory: "mindfulness",
    difficulty: "intermediate",
    duration: 15,
    image_url: "/placeholder.svg?height=150&width=400&text=Body+Scan",
    is_premium: false,
  },
  {
    id: "5",
    title: "4-7-8 Breathing Technique",
    description: "A powerful breathing exercise for relaxation and sleep.",
    content:
      "The 4-7-8 breathing technique is a breathing pattern developed by Dr. Andrew Weil. It's based on pranayama, an ancient yogic practice that helps people control their breathing. This technique is often described as a natural tranquilizer for the nervous system.\n\nHere's how to do it:\n1. Empty your lungs of air completely\n2. Breathe in quietly through your nose for 4 seconds\n3. Hold your breath for 7 seconds\n4. Exhale forcefully through your mouth, pursing your lips and making a 'whoosh' sound, for 8 seconds\n5. Repeat the cycle up to 4 times\n\nThis technique can help reduce anxiety, help you fall asleep, manage cravings, and control emotional responses like anger.",
    category: "breathing",
    subcategory: "sleep",
    difficulty: "beginner",
    duration: 3,
    image_url: "/placeholder.svg?height=150&width=400&text=4-7-8+Breathing",
    is_premium: false,
  },
  {
    id: "6",
    title: "Mindful Walking Practice",
    description: "Transform an ordinary walk into a mindful practice.",
    content:
      "Mindful walking is a form of meditation in motion. It involves being aware of your body and physical sensations as you move. Instead of focusing on getting to your destination, you focus on the journey and the experience of walking itself.\n\nTo practice mindful walking:\n1. Find a quiet place where you can walk back and forth for about 10-15 paces\n2. Begin by standing still and becoming aware of your body\n3. Start walking slowly, paying attention to the lifting, moving, and placing of each foot\n4. Notice the sensations in your feet and legs\n5. When your mind wanders, gently bring it back to the sensations of walking\n\nThis practice can help reduce stress, improve concentration, and increase your awareness of the present moment.",
    category: "mindfulness",
    subcategory: "movement",
    difficulty: "beginner",
    duration: 10,
    image_url: "/placeholder.svg?height=150&width=400&text=Mindful+Walking",
    is_premium: false,
  },
  {
    id: "7",
    title: "Sleep Hygiene Guide",
    description: "Essential practices for better sleep quality.",
    content:
      "Sleep hygiene refers to a series of healthy sleep habits that can improve your ability to fall asleep and stay asleep. Good sleep hygiene is important for both physical and mental health, helping you to feel good and function well during the day.\n\nKey sleep hygiene practices include:\n- Maintaining a consistent sleep schedule\n- Creating a quiet, dark, and cool sleeping environment\n- Avoiding screens for at least an hour before bed\n- Limiting caffeine and alcohol, especially in the afternoon and evening\n- Getting regular exercise, but not too close to bedtime\n- Managing stress through relaxation techniques\n- Avoiding large meals and excessive fluids before bedtime\n\nBy incorporating these practices into your routine, you can improve your sleep quality and overall wellbeing.",
    category: "articles",
    subcategory: "sleep",
    image_url: "/placeholder.svg?height=150&width=400&text=Sleep+Hygiene",
    is_premium: false,
  },
  {
    id: "8",
    title: "Loving-Kindness Meditation",
    description: "Cultivate compassion for yourself and others.",
    content:
      "Loving-kindness meditation (also known as Metta meditation) is a practice designed to enhance feelings of kindness and compassion toward yourself and others. It involves silently repeating phrases that express goodwill.\n\nBegin by sitting comfortably and taking a few deep breaths. Then, start by directing loving-kindness toward yourself, repeating phrases such as:\n- May I be happy\n- May I be healthy\n- May I be safe\n- May I live with ease\n\nAfter a few minutes, extend these wishes to others - first to someone you care about, then to a neutral person, then to someone difficult, and finally to all beings everywhere. This practice helps develop empathy, reduce negative emotions, and increase positive feelings of warmth and care.",
    category: "meditation",
    subcategory: "compassion",
    difficulty: "intermediate",
    duration: 15,
    image_url: "/placeholder.svg?height=150&width=400&text=Loving+Kindness",
    is_premium: true,
  },
  {
    id: "9",
    title: "Morning Mindfulness Routine",
    description: "Start your day with intention and awareness.",
    content:
      "How you begin your morning can set the tone for your entire day. A mindful morning routine helps you start the day with intention, clarity, and calm rather than rushing and stress.\n\nA simple 10-minute morning mindfulness routine:\n1. Upon waking, take 3 deep breaths before getting out of bed\n2. Spend 2 minutes stretching gently to awaken your body\n3. Sit comfortably for 5 minutes of meditation, focusing on your breath\n4. Set an intention for the day\n5. Express gratitude for 3 things in your life\n\nThis routine can help reduce morning anxiety, improve focus, and create a sense of purpose for your day ahead.",
    category: "mindfulness",
    subcategory: "morning",
    difficulty: "beginner",
    duration: 10,
    image_url: "/placeholder.svg?height=150&width=400&text=Morning+Routine",
    is_premium: false,
  },
  {
    id: "10",
    title: "Deep Sleep Meditation",
    description: "A guided practice to help you fall into restful sleep.",
    content:
      "This deep sleep meditation is designed to help you relax deeply and transition into restful sleep. It uses visualization, progressive relaxation, and gentle breathing techniques to calm your mind and prepare your body for sleep.\n\nFind a comfortable position lying down in bed. Begin by taking several deep breaths, allowing your body to sink into the mattress with each exhale. Bring your awareness to any areas of tension in your body and consciously release that tension. Imagine a warm, soothing light moving through your body from your toes to the top of your head, relaxing each part of your body it touches. As your body becomes completely relaxed, allow your mind to grow quiet, letting go of thoughts about the past or future.",
    category: "sleep",
    subcategory: "meditation",
    difficulty: "beginner",
    duration: 20,
    image_url: "/placeholder.svg?height=150&width=400&text=Sleep+Meditation",
    is_premium: true,
  },
  {
    id: "11",
    title: "Stress Management Techniques",
    description: "Practical strategies to manage stress in daily life.",
    content:
      "Stress is a normal part of life, but chronic stress can have negative effects on both physical and mental health. Learning effective stress management techniques can help you cope with stress in healthy ways.\n\nEffective stress management techniques include:\n- Regular physical activity\n- Relaxation practices like deep breathing, meditation, or yoga\n- Maintaining social connections\n- Setting realistic goals and priorities\n- Making time for hobbies and activities you enjoy\n- Getting enough sleep\n- Maintaining a healthy diet\n- Limiting caffeine and alcohol\n- Seeking professional help when needed\n\nBy incorporating these techniques into your daily routine, you can reduce the negative impact of stress on your wellbeing.",
    category: "articles",
    subcategory: "stress",
    image_url: "/placeholder.svg?height=150&width=400&text=Stress+Management",
    is_premium: false,
  },
  {
    id: "12",
    title: "Alternate Nostril Breathing",
    description: "A yogic breathing technique to balance energy and calm the mind.",
    content:
      "Alternate nostril breathing, or Nadi Shodhana, is a powerful yogic breathing technique that helps balance the left and right hemispheres of the brain, calm the nervous system, and promote mental clarity.\n\nHow to practice:\n1. Sit comfortably with your spine straight\n2. Place your left hand on your left knee\n3. Lift your right hand and fold your index and middle fingers toward your palm\n4. Close your right nostril with your right thumb\n5. Inhale slowly through your left nostril\n6. Close your left nostril with your ring finger, release your thumb\n7. Exhale through your right nostril\n8. Inhale through your right nostril\n9. Close your right nostril, release your ring finger\n10. Exhale through your left nostril\n\nThis completes one cycle. Continue for 5-10 cycles, gradually increasing over time.",
    category: "breathing",
    subcategory: "yoga",
    difficulty: "intermediate",
    duration: 5,
    image_url: "/placeholder.svg?height=150&width=400&text=Alternate+Nostril",
    is_premium: false,
  },
  {
    id: "13",
    title: "Gratitude Practice Guide",
    description: "Simple ways to cultivate gratitude for greater wellbeing.",
    content:
      "Gratitude is the practice of noticing and appreciating the positive aspects of life. Research has shown that regular gratitude practice can improve mental health, increase happiness, reduce stress, and even improve sleep quality.\n\nSimple gratitude practices to incorporate into your routine:\n1. Keep a gratitude journal - Write down 3 things you're grateful for each day\n2. Express appreciation to others - Tell someone how much you appreciate them\n3. Gratitude meditation - Reflect on things you're thankful for during meditation\n4. Gratitude walk - Notice things you appreciate during a walk\n5. Gratitude jar - Write down moments of gratitude on slips of paper and collect them in a jar\n\nEven during difficult times, finding small things to be grateful for can shift your perspective and improve your resilience.",
    category: "mindfulness",
    subcategory: "gratitude",
    difficulty: "beginner",
    duration: 5,
    image_url: "/placeholder.svg?height=150&width=400&text=Gratitude+Practice",
    is_premium: false,
  },
  {
    id: "14",
    title: "Advanced Visualization Meditation",
    description: "Use the power of your imagination to reduce stress and achieve goals.",
    content:
      "Visualization meditation is a powerful technique that uses the imagination to reduce stress, enhance focus, and help achieve personal goals. This practice involves creating detailed mental images of scenes, situations, or outcomes that promote relaxation or personal growth.\n\nTo practice visualization meditation:\n1. Find a quiet, comfortable place to sit or lie down\n2. Close your eyes and take several deep breaths to relax\n3. Begin to create a detailed mental image of a peaceful scene or desired outcome\n4. Engage all your senses - what do you see, hear, smell, taste, and feel?\n5. Immerse yourself in this visualization for 10-15 minutes\n6. Gently return your awareness to your surroundings\n\nVisualization can be used for stress reduction, pain management, performance enhancement, and personal development.",
    category: "meditation",
    subcategory: "visualization",
    difficulty: "advanced",
    duration: 15,
    image_url: "/placeholder.svg?height=150&width=400&text=Visualization",
    is_premium: true,
  },
  {
    id: "15",
    title: "Mindful Eating Practice",
    description: "Transform your relationship with food through mindfulness.",
    content:
      "Mindful eating is the practice of paying full attention to the experience of eating and drinking. It involves using all your senses to experience the colors, smells, textures, flavors, temperatures, and even the sounds of your food. This practice can help improve your relationship with food, aid digestion, and prevent overeating.\n\nTo practice mindful eating:\n1. Before eating, take a moment to appreciate the food in front of you\n2. Notice the colors, textures, and smells of your food\n3. Take small bites and chew thoroughly\n4. Put down your utensils between bites\n5. Notice the flavors and textures as you chew\n6. Pay attention to your body's hunger and fullness cues\n\nEven practicing mindful eating for just one meal a day can help you develop a healthier relationship with food and greater enjoyment of your meals.",
    category: "mindfulness",
    subcategory: "eating",
    difficulty: "beginner",
    duration: 20,
    image_url: "/placeholder.svg?height=150&width=400&text=Mindful+Eating",
    is_premium: false,
  },
]

