import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get the current user from Supabase
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({
        subscription: null,
        message: "User not authenticated",
      })
    }

    // Fetch the user's subscription from the database
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching subscription:", error)

      // If the error is because no rows were returned, return a default subscription
      if (error.code === "PGRST116") {
        return NextResponse.json({
          subscription: {
            id: null,
            user_id: session.user.id,
            status: "inactive",
            plan_type: "free",
            cancel_at_period_end: false,
            current_period_end: null,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            created_at: new Date().toISOString(),
          },
          message: "No subscription found",
        })
      }

      // For other errors, return an error response
      return NextResponse.json({
        subscription: null,
        message: "Error fetching subscription",
        error: error.message,
      })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("Subscription API error:", error)
    return NextResponse.json(
      {
        subscription: null,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

