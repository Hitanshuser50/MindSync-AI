"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Phone, Globe, Search, AlertTriangle } from "lucide-react"

type EmergencyContact = {
  id: string
  name: string
  description: string
  phone: string | null
  website: string | null
  country: string | null
  is_global: boolean
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmergencyContacts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredContacts(contacts)
    } else {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.country && contact.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
          contact.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredContacts(filtered)
    }
  }, [searchQuery, contacts])

  const fetchEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .order("is_global", { ascending: false })

      if (error) throw error
      setContacts(data || [])
      setFilteredContacts(data || [])
    } catch (error) {
      console.error("Error fetching emergency contacts:", error)
      toast({
        title: "Error",
        description: "Failed to load emergency resources.",
        variant: "destructive",
      })
      // Use placeholder data if database fetch fails
      setContacts(placeholderContacts)
      setFilteredContacts(placeholderContacts)
    } finally {
      setIsLoading(false)
    }
  }

  // Placeholder emergency contacts if none in database
  const placeholderContacts: EmergencyContact[] = [
    {
      id: "1",
      name: "National Suicide Prevention Lifeline",
      description: "24/7, free and confidential support for people in distress.",
      phone: "1-800-273-8255",
      website: "https://suicidepreventionlifeline.org",
      country: "United States",
      is_global: false,
    },
    {
      id: "2",
      name: "Crisis Text Line",
      description: "Text HOME to 741741 to connect with a Crisis Counselor.",
      phone: "Text HOME to 741741",
      website: "https://www.crisistextline.org",
      country: "United States",
      is_global: false,
    },
    {
      id: "3",
      name: "International Association for Suicide Prevention",
      description: "Resources and crisis centers around the world.",
      phone: null,
      website: "https://www.iasp.info/resources/Crisis_Centres/",
      country: null,
      is_global: true,
    },
    {
      id: "4",
      name: "Samaritans (UK)",
      description: "Confidential support for people experiencing feelings of distress or despair.",
      phone: "116 123",
      website: "https://www.samaritans.org",
      country: "United Kingdom",
      is_global: false,
    },
    {
      id: "5",
      name: "Lifeline Australia",
      description: "24/7 crisis support and suicide prevention services.",
      phone: "13 11 14",
      website: "https://www.lifeline.org.au",
      country: "Australia",
      is_global: false,
    },
  ]

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading emergency resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Emergency Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            If you or someone you know is in immediate danger, please call your local emergency services (such as 911)
            right away.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Resources</CardTitle>
            <CardDescription>Find crisis support services by country or name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by country or service name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {filteredContacts.length > 0 ? (
            <>
              {/* Global Resources */}
              {filteredContacts.some((contact) => contact.is_global) && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Global Resources</h2>
                  <div className="space-y-4">
                    {filteredContacts
                      .filter((contact) => contact.is_global)
                      .map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                      ))}
                  </div>
                </div>
              )}

              {/* Country-Specific Resources */}
              {filteredContacts.some((contact) => !contact.is_global) && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Country-Specific Resources</h2>
                  <div className="space-y-4">
                    {filteredContacts
                      .filter((contact) => !contact.is_global)
                      .map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No emergency resources found for your search. Please try different keywords or clear your search.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-4">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{contact.name}</CardTitle>
            {contact.country && <div className="text-sm text-muted-foreground mt-1">{contact.country}</div>}
          </div>
          {contact.is_global && <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Global</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{contact.description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {contact.phone && (
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href={`tel:${contact.phone.replace(/\D/g, "")}`}>
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </a>
            </Button>
          )}
          {contact.website && (
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <a href={contact.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
                <span>Visit Website</span>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

