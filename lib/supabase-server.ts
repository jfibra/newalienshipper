import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Server-side Supabase client (for server components)
export const createSupabaseServerClient = () => createServerComponentClient({ cookies })

// Helper functions for server-side use
export const getCurrentUser = async () => {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
