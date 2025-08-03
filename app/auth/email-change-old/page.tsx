"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmailChangeOldPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => router.replace("/login?emailchange=1"), 2000)
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-2">Confirm Your Email Change</h1>
        <p className="text-gray-700 mb-4">Please confirm your email change. Redirecting...</p>
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}
