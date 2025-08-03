"use client"
import { useUserSession } from "./use-user-session"

export function useUser() {
  return useUserSession()
}
