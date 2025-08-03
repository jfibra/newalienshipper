import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      company,
      phone,
      businessType,
      monthlyVolume,
      agreedTerms,
      newsletter,
    } = await req.json()


    if (!email || !password || !firstName || !lastName || !agreedTerms) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Standard email validation regex (RFC 5322 Official Standard)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 })
    }

    // Create user in Supabase Auth with proper email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company,
          phone,
          business_type: businessType,
          monthly_volume: monthlyVolume,
          newsletter,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/confirm-signup`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 400 })
    }

    // Always create user details in users table after signup
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      company,
      phone,
      business_type: businessType,
      monthly_shipping_volume: monthlyVolume,
      agreed_terms: agreedTerms,
      newsletter_opt_in: newsletter,
    })
    if (userError) {
      console.error("User table insert error:", userError)
      // Don't fail the signup if user table insert fails
    }

    return NextResponse.json({
      success: true,
      message: authData.user.confirmation_sent_at
        ? "Account created successfully! Please check your email to verify your account."
        : "Account created and confirmed successfully!",
      user: authData.user,
      needsConfirmation: !!authData.user.confirmation_sent_at,
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
