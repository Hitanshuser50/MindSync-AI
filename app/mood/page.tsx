"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, CalendarIcon, BarChart, List, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, isToday, isYesterday, subDays } from "date-fns"

// Mood options with emojis and colors
const moodOptions = [
  { value: "great", label: "Great", emoji: "😄", color: "bg-green-100 border-green-300 text-green-700" },
  { value: "good", label: "Good", emoji: "🙂", color: "bg-blue-100 border-blue-300 text-blue-700" },
  { value: "okay", label: "Okay", emoji: "😐", color: "bg-yellow-100 border-yellow-300 text-yellow-700" },
  { value: "bad", label: "Bad", emoji: "😔", color: "bg-orange-100 border-orange-300 text-orange-700" },
  { value: "awful", label: "Awful", emoji: "😢", color: "bg-red-100 border-red-300 text-red-700" },
]

// Type for mood entry
type MoodEntry = {
  id: string
  user_id: string
  mood: string
  notes: string
  created_at: string
}

export default function MoodTrackerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMoodForm, setShowMoodForm] = useState(false)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchMoodEntries()
  }, [user, router])

  const fetchMoodEntries = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setMoodEntries(data || [])
    } catch (error: any) {
      console.error("Error fetching mood entries:", error)
      setError("Failed to load mood entries. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMood = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "You need to select how you're feeling.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const newEntry = {
        user_id: user?.id,
        mood: selectedMood,
        notes: notes.trim(),
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("mood_entries").insert(newEntry).select().single()

      if (error) throw error

      setMoodEntries([data, ...moodEntries])
      setSelectedMood(null)
      setNotes("")
      setShowMoodForm(false)

      toast({
        title: "Mood logged successfully",
        description: "Your mood has been recorded.",
      })
    } catch (error: any) {
      console.error("Error adding mood entry:", error)
      setError("Failed to save your mood. Please try again.")

      toast({
        title: "Error",
        description: "Failed to save your mood. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMoodEmoji = (mood: string) => {
    const option = moodOptions.find((option) => option.value === mood)
    return option ? option.emoji : "😐"
  }

  const getMoodColor = (mood: string) => {
    const option = moodOptions.find((option) => option.value === mood)
    return option ? option.color : "bg-gray-100 border-gray-300 text-gray-700"
  }

  const formatEntryDate = (dateString: string) => {
    const date = parseISO(dateString)

    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a")
    }
  }

  // Get entries for the selected date
  const getEntriesForSelectedDate = () => {
    if (!selectedDate) return []

    return moodEntries.filter((entry) => {
      const entryDate = parseISO(entry.created_at)
      return (
        entryDate.getDate() === selectedDate.getDate() &&
        entryDate.getMonth() === selectedDate.getMonth() &&
        entryDate.getFullYear() === selectedDate.getFullYear()
      )
    })
  }

  // Calculate mood distribution for the last 30 days
  const getMoodDistribution = () => {
    const thirtyDaysAgo = subDays(new Date(), 30)

    const recentEntries = moodEntries.filter((entry) => {
      const entryDate = parseISO(entry.created_at)
      return entryDate >= thirtyDaysAgo
    })

    const distribution = {
      great: 0,
      good: 0,
      okay: 0,
      bad: 0,
      awful: 0,
    }

    recentEntries.forEach((entry) => {
      distribution[entry.mood as keyof typeof distribution]++
    })

    return distribution
  }

  const moodDistribution = getMoodDistribution()
  const totalMoods = Object.values(moodDistribution).reduce((sum, count) => sum + count, 0)

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your mood data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mood Tracker</h1>
            <p className="text-muted-foreground">Track and monitor your emotional wellbeing over time</p>
          </div>
          <Button onClick={() => setShowMoodForm(!showMoodForm)} className="gap-2">
            {showMoodForm ? (
              "Cancel"
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Log Mood
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showMoodForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>How are you feeling?</CardTitle>
                  <CardDescription>Select your current mood and add any notes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {moodOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        className={`h-auto flex flex-col py-3 px-2 border-2 ${
                          selectedMood === option.value ? option.color : ""
                        }`}
                        onClick={() => setSelectedMood(option.value)}
                      >
                        <span className="text-2xl mb-1">{option.emoji}</span>
                        <span className="text-xs font-medium">{option.label}</span>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium">
                      Notes (optional)
                    </label>
                    <Textarea
                      id="notes"
                      placeholder="Add any thoughts or reflections..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleAddMood} disabled={isSubmitting || !selectedMood}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Mood"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-4 mb-6 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="history">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="history" className="gap-2">
              <List className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <BarChart className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            {moodEntries.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No mood entries yet</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Start tracking your mood to gain insights into your emotional patterns over time.
                  </p>
                  <Button onClick={() => setShowMoodForm(true)}>Log Your First Mood</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {moodEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-full ${getMoodColor(entry.mood)}`}
                          >
                            <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold capitalize">{entry.mood}</h3>
                              <p className="text-xs text-muted-foreground">{formatEntryDate(entry.created_at)}</p>
                            </div>
                            {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">
                      {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                    </h3>

                    {getEntriesForSelectedDate().length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No mood entries for this date</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowMoodForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Entry
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getEntriesForSelectedDate().map((entry) => (
                          <div key={entry.id} className="border rounded-md p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
                              <span className="font-medium capitalize">{entry.mood}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {format(parseISO(entry.created_at), "h:mm a")}
                              </span>
                            </div>
                            {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>Your Mood Patterns</CardTitle>
                <CardDescription>Analysis of your mood entries over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {totalMoods === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You need at least one mood entry to see insights</p>
                    <Button variant="outline" onClick={() => setShowMoodForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Mood Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Mood Distribution</h4>
                      <div className="space-y-3">
                        {moodOptions.map((option) => (
                          <div key={option.value} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{option.emoji}</span>
                              <span className="text-sm font-medium capitalize">{option.value}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {moodDistribution[option.value as keyof typeof moodDistribution]} entries
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    totalMoods > 0
                                      ? (moodDistribution[option.value as keyof typeof moodDistribution] / totalMoods) *
                                        100
                                      : 0
                                  }%`,
                                }}
                                transition={{ duration: 1, delay: 0.1 }}
                                className={`h-full rounded-full ${option.color.split(" ")[0]}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {totalMoods === 0
                          ? "Start logging your moods to see insights."
                          : `You've logged ${totalMoods} mood ${totalMoods === 1 ? "entry" : "entries"} in the last 30 days. 
                          Your most frequent mood was ${
                            Object.entries(moodDistribution).sort(([, a], [, b]) => b - a)[0][0]
                          }.`}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

