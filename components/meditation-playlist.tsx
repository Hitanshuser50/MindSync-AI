"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, Clock, Plus, Check, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { usePremium } from "@/hooks/use-premium"
import { useToast } from "@/components/ui/use-toast"

type MeditationItem = {
  id: string
  title: string
  duration: number
  category: string
  isPremium?: boolean
  coverImage?: string
}

interface MeditationPlaylistProps {
  title: string
  description?: string
  meditations: MeditationItem[]
  onSelectMeditation: (id: string) => void
  currentMeditationId?: string
}

export default function MeditationPlaylist({
  title,
  description,
  meditations,
  onSelectMeditation,
  currentMeditationId,
}: MeditationPlaylistProps) {
  const [favorites, setFavorites] = useState<string[]>([])
  const { isPremium } = usePremium()
  const { toast } = useToast()

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id))
      toast({
        title: "Removed from favorites",
        description: "Meditation removed from your favorites",
      })
    } else {
      setFavorites([...favorites, id])
      toast({
        title: "Added to favorites",
        description: "Meditation added to your favorites",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {meditations.map((meditation, index) => (
              <motion.div
                key={meditation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                    currentMeditationId === meditation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                  onClick={() => onSelectMeditation(meditation.id)}
                >
                  <div className="flex-shrink-0 mr-3">
                    {currentMeditationId === meditation.id ? (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Play className="h-4 w-4 text-primary ml-0.5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Play className="h-4 w-4 text-muted-foreground ml-0.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate">{meditation.title}</p>
                      {meditation.isPremium && !isPremium && (
                        <div className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs flex items-center">
                          <Sparkles className="h-3 w-3 mr-0.5" />
                          <span>Premium</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDuration(meditation.duration)}</span>
                      <span className="mx-1">•</span>
                      <span className="capitalize">{meditation.category}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => toggleFavorite(meditation.id, e)}
                  >
                    {favorites.includes(meditation.id) ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {meditations.length} meditation{meditations.length !== 1 ? "s" : ""} available
        </p>
      </CardFooter>
    </Card>
  )
}

