"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Smile, Frown, Meh, TrendingUp, Calendar, Trash2, Edit } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type MoodEntry = {
  id: string
  user_id: string
  mood_score: number
  notes: string | null
  created_at: string
}

export default function MoodTrackerPage() {
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [editMoodScore, setEditMoodScore] = useState<number>(0)
  const [editNotes, setEditNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchMoodEntries()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchMoodEntries = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mood")

      if (!response.ok) {
        throw new Error("Failed to fetch mood entries")
      }

      const data = await response.json()
      setMoodEntries(data.entries || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (moodScore === null) {
      toast({
        title: "Error",
        description: "Please select a mood before submitting.",
        variant: "destructive",
      })
      return
    }

    // Only check authentication for non-anonymous flows
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your mood.",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood_score: moodScore, // Make sure we're using mood_score, not mood
          notes: notes || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server error:", errorData)
        throw new Error(errorData.error || "Failed to create mood entry")
      }

      toast({
        title: "Success",
        description: "Your mood has been recorded.",
      })

      // Reset form and refresh entries
      setMoodScore(null)
      setNotes("")
      fetchMoodEntries()
    } catch (error) {
      console.error("Error submitting mood:", error)
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? String(error.message)
            : "Failed to record your mood. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (entry: MoodEntry) => {
    setEditingEntry(entry)
    setEditMoodScore(entry.mood_score)
    setEditNotes(entry.notes || "")
  }

  const handleUpdateEntry = async () => {
    if (!editingEntry) return

    setIsEditing(true)

    try {
      const response = await fetch(`/api/mood/${editingEntry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood_score: editMoodScore, // Make sure we're using mood_score, not mood
          notes: editNotes || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update mood entry")
      }

      toast({
        title: "Success",
        description: "Your mood entry has been updated.",
      })

      setEditingEntry(null)
      fetchMoodEntries()
    } catch (error) {
      console.error("Error updating mood entry:", error)
      toast({
        title: "Error",
        description: "Failed to update your mood entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/mood/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete mood entry")
      }

      toast({
        title: "Success",
        description: "Your mood entry has been deleted.",
      })

      fetchMoodEntries()
    } catch (error) {
      console.error("Error deleting mood entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete your mood entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
          <p className="text-muted-foreground">Track your emotional wellbeing and identify patterns over time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mood Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling today?</CardTitle>
              <CardDescription>Select your mood and add optional notes.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <Button
                      key={score}
                      type="button"
                      variant={moodScore === score ? "default" : "outline"}
                      className="h-16 w-16 rounded-full"
                      onClick={() => setMoodScore(score)}
                    >
                      {score <= 2 ? (
                        <Frown
                          className={`h-8 w-8 ${moodScore === score ? "text-primary-foreground" : "text-destructive"}`}
                        />
                      ) : score === 3 ? (
                        <Meh
                          className={`h-8 w-8 ${moodScore === score ? "text-primary-foreground" : "text-yellow-500"}`}
                        />
                      ) : (
                        <Smile
                          className={`h-8 w-8 ${moodScore === score ? "text-primary-foreground" : "text-green-500"}`}
                        />
                      )}
                    </Button>
                  ))}
                </div>
                <div>
                  <Textarea
                    placeholder="Add notes about how you're feeling (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting || moodScore === null}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Mood"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Mood History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Mood History
              </CardTitle>
              <CardDescription>View your recent mood entries and patterns.</CardDescription>
            </CardHeader>
            <CardContent>
              {moodEntries.length > 0 ? (
                <div className="space-y-4">
                  {moodEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">{getMoodIcon(entry.mood_score)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">
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
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                        {entry.notes && <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>}
                      </div>
                      <div className="flex gap-2 ml-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Mood Entry</DialogTitle>
                              <DialogDescription>Update your mood score and notes.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex justify-between items-center">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <Button
                                    key={score}
                                    type="button"
                                    variant={editMoodScore === score ? "default" : "outline"}
                                    className="h-12 w-12 rounded-full"
                                    onClick={() => setEditMoodScore(score)}
                                  >
                                    {score <= 2 ? (
                                      <Frown
                                        className={`h-6 w-6 ${
                                          editMoodScore === score ? "text-primary-foreground" : "text-destructive"
                                        }`}
                                      />
                                    ) : score === 3 ? (
                                      <Meh
                                        className={`h-6 w-6 ${
                                          editMoodScore === score ? "text-primary-foreground" : "text-yellow-500"
                                        }`}
                                      />
                                    ) : (
                                      <Smile
                                        className={`h-6 w-6 ${
                                          editMoodScore === score ? "text-primary-foreground" : "text-green-500"
                                        }`}
                                      />
                                    )}
                                  </Button>
                                ))}
                              </div>
                              <div>
                                <Textarea
                                  placeholder="Add notes about how you're feeling (optional)"
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingEntry(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateEntry} disabled={isEditing}>
                                {isEditing ? "Saving..." : "Save Changes"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
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
                              <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)} disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No mood entries yet. Start tracking your mood today!</p>
                </div>
              )}
            </CardContent>
            {moodEntries.length > 0 && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/mood-tracker/history")}>
                  View All Entries
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

