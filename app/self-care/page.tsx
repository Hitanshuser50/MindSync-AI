"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { BookOpen, Wind, Leaf, Brain, Moon, Sun, Search, Filter, Clock, Sparkles, Music } from "lucide-react"
import GuidedMeditation from "@/components/guided-meditation"
import MeditationPlaylist from "@/components/meditation-playlist"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { usePremium } from "@/hooks/use-premium"
import { audioFiles } from "@/lib/audio-files"

// Import the usage limits hook and upgrade prompt
import { useUsageLimits } from "@/hooks/use-usage-limits"
import UpgradePrompt from "@/components/upgrade-prompt"

// Types
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

export default function SelfCarePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSubcategory, setActiveSubcategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterDuration, setFilterDuration] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMeditation, setSelectedMeditation] = useState<string>("med1")

  // Add the usage limits hook
  const {
    usageCount,
    hasReachedLimit,
    incrementUsage,
    getRemainingUsage,
    isAnonymous,
    isPremium: hasPremium,
  } = useUsageLimits("self-care")

  // Add state to track if we should show the limit warning
  const [showLimitWarning, setShowLimitWarning] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setIsLoading(true)

      // Try to fetch from database first
      const { data, error } = await supabase.from("resources").select("*").order("created_at", { ascending: false })

      if (error) {
        // If not found in database, use placeholder
        setResources(enhancedPlaceholderResources)
      } else {
        setResources(data || enhancedPlaceholderResources)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to load self-care resources.",
        variant: "destructive",
      })
      // Fallback to placeholder data
      setResources(enhancedPlaceholderResources)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique subcategories for the active category
  const getSubcategories = () => {
    if (activeCategory === "all") return ["all"]

    const subcategories = [
      "all",
      ...new Set(
        resources
          .filter((r) => activeCategory === "all" || r.category === activeCategory)
          .map((r) => r.subcategory || "other"),
      ),
    ]

    return subcategories
  }

  // Filter resources based on all criteria
  const filteredResources = resources.filter((resource) => {
    // Search query filter
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.content.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory

    // Subcategory filter
    const matchesSubcategory = activeSubcategory === "all" || resource.subcategory === activeSubcategory

    // Difficulty filter
    const matchesDifficulty = filterDifficulty === "all" || resource.difficulty === filterDifficulty

    // Duration filter
    const matchesDuration =
      filterDuration === "all" ||
      (filterDuration === "short" && (resource.duration || 0) <= 5) ||
      (filterDuration === "medium" && (resource.duration || 0) > 5 && (resource.duration || 0) <= 15) ||
      (filterDuration === "long" && (resource.duration || 0) > 15)

    return matchesSearch && matchesCategory && matchesSubcategory && matchesDifficulty && matchesDuration
  })

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meditation":
        return <Leaf className="h-5 w-5" />
      case "breathing":
        return <Wind className="h-5 w-5" />
      case "articles":
        return <BookOpen className="h-5 w-5" />
      case "sleep":
        return <Moon className="h-5 w-5" />
      case "mindfulness":
        return <Brain className="h-5 w-5" />
      case "morning":
        return <Sun className="h-5 w-5" />
      case "relaxation":
        return <Music className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  // Handle resource click with usage tracking
  const handleResourceClick = (resource: Resource) => {
    // If premium content but user is not premium
    if (resource.is_premium && !isPremium) {
      router.push("/subscription")
      return
    }

    // If free user has reached limit
    if (hasReachedLimit && !isPremium) {
      setShowLimitWarning(true)
      return
    }

    // Otherwise, increment usage and navigate
    if (!isPremium) {
      incrementUsage()
    }

    router.push(`/self-care/${resource.id}`)
  }

  // Create meditation items from audio files
  const meditationItems = Object.entries(audioFiles).map(([id, audio]) => ({
    id,
    title: audio.name,
    duration: audio.duration,
    category: audio.category,
    isPremium: id.includes("premium"),
    coverImage: `/placeholder.svg?height=200&width=400&text=${audio.name.replace(/\s+/g, "+")}`,
  }))

  // Get the selected meditation details
  const selectedMeditationDetails =
    audioFiles[selectedMeditation as keyof typeof audioFiles] || audioFiles.relaxingGuitar1

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
        {hasReachedLimit && showLimitWarning && (
          <UpgradePrompt
            type={isAnonymous ? "anonymous" : "free"}
            feature="self-care resources"
            onClose={() => setShowLimitWarning(false)}
          />
        )}

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Self-Care Library</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of guided meditations, breathing exercises, and articles to support your mental
            wellbeing journey.
          </p>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-md max-w-2xl mx-auto">
            <p className="text-sm">
              <strong>Note:</strong> We've added real audio files to our relaxation meditations! Try them out below.
              Other meditations will use text-based guidance.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-4">
            {!hasPremium && (
              <div className="text-sm text-muted-foreground">
                {getRemainingUsage()} resource{getRemainingUsage() !== 1 ? "s" : ""} remaining
              </div>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="meditation" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="meditation">Guided Meditations</TabsTrigger>
            <TabsTrigger value="resources">Self-Care Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="meditation">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GuidedMeditation
                  title={selectedMeditationDetails.name}
                  description={selectedMeditationDetails.description}
                  audioSrc={selectedMeditationDetails.url}
                  duration={selectedMeditationDetails.duration}
                  isPremium={selectedMeditation.includes("premium")}
                  coverImage={`/placeholder.svg?height=200&width=400&text=${selectedMeditationDetails.name.replace(/\s+/g, "+")}`}
                  category={selectedMeditationDetails.category}
                  allowDownload={true}
                />
              </div>

              <div>
                <MeditationPlaylist
                  title="Meditation Library"
                  description="Select a meditation to play"
                  meditations={meditationItems}
                  onSelectMeditation={setSelectedMeditation}
                  currentMeditationId={selectedMeditation}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 border rounded-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Difficulty</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Duration</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filterDuration}
                      onChange={(e) => setFilterDuration(e.target.value)}
                    >
                      <option value="all">Any Duration</option>
                      <option value="short">Short (≤ 5 min)</option>
                      <option value="medium">Medium (6-15 min)</option>
                      <option value="long">Long ({">"}15 min)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterDifficulty("all")
                        setFilterDuration("all")
                        setSearchQuery("")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <Tabs defaultValue="all" onValueChange={setActiveCategory}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="meditation">Meditation</TabsTrigger>
                <TabsTrigger value="breathing">Breathing</TabsTrigger>
                <TabsTrigger value="sleep">Sleep</TabsTrigger>
                <TabsTrigger value="mindfulness">Mindfulness</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
              </TabsList>

              {activeCategory !== "all" && (
                <TabsList className="mb-6">
                  {getSubcategories().map((subcategory) => (
                    <TabsTrigger
                      key={subcategory}
                      value={subcategory}
                      onClick={() => setActiveSubcategory(subcategory)}
                      className={activeSubcategory === subcategory ? "bg-primary text-primary-foreground" : ""}
                    >
                      {subcategory === "all" ? "All" : subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}

              <TabsContent value={activeCategory} className="mt-6">
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No resources found. Try adjusting your filters or search terms.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory("all")
                        setActiveSubcategory("all")
                        setFilterDifficulty("all")
                        setFilterDuration("all")
                      }}
                    >
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource, index) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onClick={() => handleResourceClick(resource)}
                        isPremiumUser={isPremium}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ResourceCard({
  resource,
  onClick,
  isPremiumUser,
  index,
}: {
  resource: Resource
  onClick: () => void
  isPremiumUser: boolean
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="h-full flex flex-col transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
        <div className="relative">
          <img
            src={resource.image_url || `/placeholder.svg?height=150&width=400&text=${resource.category}`}
            alt={resource.title}
            className="w-full h-40 object-cover rounded-t-lg"
          />
          {resource.is_premium && (
            <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span>Premium</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(resource.category)}
            <span className="text-xs text-muted-foreground capitalize">{resource.category}</span>
            {resource.subcategory && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground capitalize">{resource.subcategory}</span>
              </>
            )}
          </div>
          <h3 className="text-xl font-medium mb-2">{resource.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>

          {(resource.difficulty || resource.duration) && (
            <div className="flex items-center gap-3 mt-3">
              {resource.difficulty && (
                <div className="text-xs px-2 py-1 bg-muted rounded-full">{resource.difficulty}</div>
              )}
              {resource.duration && (
                <div className="text-xs px-2 py-1 bg-muted rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {resource.duration} min
                </div>
              )}
            </div>
          )}
        </CardContent>
        <div className="pt-0 pb-5 px-5">
          <Button variant={resource.is_premium && !isPremiumUser ? "outline" : "default"} className="w-full gap-2">
            {resource.is_premium && !isPremiumUser ? (
              <>
                <Sparkles className="h-4 w-4" />
                Unlock with Premium
              </>
            ) : (
              "View Resource"
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

// Helper function to get category icon
function getCategoryIcon(category: string) {
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
    case "relaxation":
      return <Music className="h-5 w-5 text-primary" />
    default:
      return <BookOpen className="h-5 w-5 text-primary" />
  }
}

// Enhanced placeholder resources with more categories and metadata
const enhancedPlaceholderResources: Resource[] = [
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

