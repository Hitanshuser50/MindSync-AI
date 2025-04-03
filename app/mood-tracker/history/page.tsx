"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Smile, Frown, Meh, ArrowLeft, Calendar, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getUserMoodEntries, deleteMoodEntry, type MoodEntry } from "@/app/actions/mood-actions"

export default function MoodHistoryPage() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    fetchMoodEntries()
  }, [user, router])

  const fetchMoodEntries = async () => {
    try {
      const entries = await getUserMoodEntries(100) // Get more entries for history page
      setMoodEntries(entries || [])
    } catch (error) {
      console.error("Error fetching mood entries:", error)
      toast({
        title: "Error",
        description: "Failed to load your mood history.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteMoodEntry(id)

      toast({
        title: "Success",
        description: "Mood entry deleted.",
      })

      fetchMoodEntries()
    } catch (error) {
      console.error("Error deleting mood entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete mood entry. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getMoodIcon = (score: number) => {
    switch (score) {
      case 1:
      case 2:
        return <Frown className="h-6 w-6 text-destructive" />
      case 3:
        return <Meh className="h-6 w-6 text-yellow-500" />
      case 4:
      case 5:
        return <Smile className="h-6 w-6 text-green-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your mood history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/mood-tracker")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mood Tracker
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Mood History</h1>
          <p className="text-muted-foreground">Review all your past mood entries</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Mood Entries</CardTitle>
            <CardDescription>Your complete mood tracking history</CardDescription>
          </CardHeader>
          <CardContent>
            {moodEntries.length > 0 ? (
              <div className="space-y-4">
                {moodEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start p-4 border rounded-md">
                    <div className="mr-4 mt-1">{getMoodIcon(entry.mood_score)}</div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <span className="font-medium text-lg">
                          {entry.mood_score === 1
                            ? "Very Low"
                            : entry.mood_score === 2
                              ? "Low"
                              : entry.mood_score === 3
                                ? "Neutral"
                                : entry.mood_score === 4
                                  ? "Good"
                                  : "Excellent"}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center mt-1 sm:mt-0">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                      {entry.notes && <p className="text-sm text-foreground mt-2">{entry.notes}</p>}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-2">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Mood Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this mood entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No mood entries found. Start tracking your mood to see your history.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/mood-tracker")}>
                  Go to Mood Tracker
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

