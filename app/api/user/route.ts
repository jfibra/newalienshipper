import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) throw new Error("Supabase env vars not set")
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(req: NextRequest) {
  const token = req.cookies.get("sb-access-token")?.value
  if (!token) return NextResponse.json({ user: null })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return NextResponse.json({ user: null })
  return NextResponse.json({ user: data.user })
}
