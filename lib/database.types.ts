export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          notes?: string | null
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string
          content: string
          category: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content: string
          category: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content?: string
          category?: string
          image_url?: string | null
          created_at?: string
        }
      }
      emergency_contacts: {
        Row: {
          id: string
          name: string
          description: string
          phone: string | null
          website: string | null
          country: string | null
          is_global: boolean
        }
        Insert: {
          id?: string
          name: string
          description: string
          phone?: string | null
          website?: string | null
          country?: string | null
          is_global?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string
          phone?: string | null
          website?: string | null
          country?: string | null
          is_global?: boolean
        }
      }
    }
  }
}

