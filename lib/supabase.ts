import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Client-side Supabase client (for components)
export const createSupabaseClient = () => createClientComponentClient()

// Export a default supabase client instance
export const supabase = createClientComponentClient()

// Types
export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  company: string
  phone: string
  business_type: string
  monthly_volume: string
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  user_id: string
  tracking_number: string
  from_address: any
  to_address: any
  package_details: any
  carrier: string
  service: string
  status: string
  created_at: string
  updated_at: string
}

// Helper functions for client-side use
export const signOut = async () => {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error

  // Clear any local storage items
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    localStorage.removeItem("supabase.auth.token")
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  if (error) throw error
  return data
}

export const sendMagicLink = async (email: string) => {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/magic-link-callback`,
    },
  })
  if (error) throw error
  return data
}

export const resetPassword = async (email: string) => {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) throw error
  return data
}
