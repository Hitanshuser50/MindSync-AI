import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file or environment configuration.")
}

// Create a singleton instance of the Supabase client
const supabaseClient = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

export const supabase = supabaseClient

