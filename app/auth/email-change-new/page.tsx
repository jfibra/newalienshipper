"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmailChangeNewPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => router.replace("/dashboard"), 2000)
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold mb-2">Email Updated!</h1>
        <p className="text-gray-700 mb-4">Your email has been updated. Redirecting...</p>
        <div className="animate-spin h-8 w-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}
