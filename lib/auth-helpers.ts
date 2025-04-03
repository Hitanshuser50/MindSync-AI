import { supabase } from "@/lib/supabase"

// Simplified sign-in function
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Sign in error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to sign in. Please try again.",
    }
  }
}

// Simplified sign-up function
export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Sign up error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
    }
  }
}

// Fixed Google sign-in function
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error("Google sign in error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to sign in with Google. Please try again.",
    }
  }
}

// Sign out function
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Sign out error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to sign out. Please try again.",
    }
  }
}

// Password reset function
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error.message)
    return {
      success: false,
      error: error.message || "Failed to send reset link. Please try again.",
    }
  }
}

