import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { accessToken, password } = await request.json()

    if (!accessToken || !password) {
      return NextResponse.json({ error: "Access token and password are required" }, { status: 400 })
    }

    // Verify the access token and update the user's password
    const { data: user, error: userError } = await supabase.auth.admin.updateUserById(accessToken, { password })

    if (userError) {
      console.error("Error updating user password:", userError)
      return NextResponse.json({ error: "Invalid invitation link or expired token" }, { status: 400 })
    }

    // Create user profile if it doesn't exist
    if (user.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.user.id,
        email: user.user.email,
        full_name: user.user.user_metadata?.full_name || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // Don't fail the request if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password set successfully",
    })
  } catch (error) {
    console.error("Error in invite API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
