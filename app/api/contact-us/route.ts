import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, subject, message } = body

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase.from("contact_us").insert([
      {
        first_name: firstName,
        last_name: lastName,
        email,
        company: company || null,
        subject,
        message,
      },
    ]).select("id, submitted_at")

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.[0]?.id, submitted_at: data?.[0]?.submitted_at })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to submit contact form" }, { status: 500 })
  }
}
