"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function useUserSession() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }

      // Handle sign out
      if (event === "SIGNED_OUT") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
        }
      }

      // Handle sign in
      if (event === "SIGNED_IN" && session?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(session.user))
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return { user, loading }
}
