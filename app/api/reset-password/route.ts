import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { accessToken, password } = await request.json()

    if (!accessToken || !password) {
      return NextResponse.json({ error: "Access token and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Set the session using the access token from the password reset flow
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser(accessToken)

    if (sessionError || !user) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 401 })
    }

    // Update the user's password using the access token
    const { error: updateError } = await supabase.auth.updateUser({ password }, { accessToken })

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json({ error: updateError.message || "Failed to update password" }, { status: 400 })
    }

    // Sign out all sessions to force re-login with new password
    await supabase.auth.signOut()

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
