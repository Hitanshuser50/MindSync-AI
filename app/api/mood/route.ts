import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "30")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ entries: data })
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mood_score, notes } = await req.json()

    if (typeof mood_score !== "number" || mood_score < 1 || mood_score > 5) {
      return NextResponse.json({ error: "Mood score must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        user_id: session.user.id,
        mood_score,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    return NextResponse.json({ entry: data })
  } catch (error) {
    console.error("Error creating mood entry:", error)
    return NextResponse.json({ error: "Failed to create mood entry" }, { status: 500 })
  }
}

