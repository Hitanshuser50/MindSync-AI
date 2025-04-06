// Audio files for meditations and relaxation exercises
export const audioFiles = {
  // Relaxing guitar loops
  relaxingGuitar1: {
    name: "Relaxing Guitar Loop 1",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/relaxing-guitar-loop-v8-252351-7u1OOPOutQ3GXVxPIYrEAxCAKsnjZ1.mp3",
    duration: 180, // in seconds (estimated)
    category: "relaxation",
    description: "Gentle guitar melody to help you unwind and relax",
  },
  relaxingGuitar2: {
    name: "Relaxing Guitar Loop 2",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/relaxing-guitar-loop-v8-252351-Xw6Ghsre6aa2k1ezskw1RLCvNOsJV1.mp3",
    duration: 180, // in seconds (estimated)
    category: "relaxation",
    description: "Soothing guitar tones for deep relaxation and stress relief",
  },
  relaxingGuitar3: {
    name: "Relaxing Guitar Loop 3",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/relaxing-guitar-loop-v5-245859-S4FSJ6GLxElnMZpF5z4SGniDeDfFR9.mp3",
    duration: 180, // in seconds (estimated)
    category: "relaxation",
    description: "Calming guitar melodies to ease anxiety and promote peace",
  },
  // Demo placeholders for other categories
  morningMeditation: {
    name: "Morning Meditation",
    url: "", // Will use fallback text-based meditation
    duration: 300,
    category: "morning",
    description: "Start your day with clarity and positive energy",
  },
  deepSleep: {
    name: "Deep Sleep Journey",
    url: "", // Will use fallback text-based meditation
    duration: 900,
    category: "sleep",
    description: "Gentle guidance into deep, restful sleep",
  },
}

// Helper function to get random audio file from a category
export function getRandomAudioFromCategory(category: string) {
  const categoryFiles = Object.values(audioFiles).filter((file) => file.category === category)
  if (categoryFiles.length === 0) return null

  return categoryFiles[Math.floor(Math.random() * categoryFiles.length)]
}

// Helper function to check if an audio file exists
export function audioFileExists(url: string): boolean {
  return url !== undefined && url !== null && url.trim() !== ""
}

