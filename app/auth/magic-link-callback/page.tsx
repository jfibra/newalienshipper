"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

function MagicLinkCallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleMagicLinkCallback = async () => {
      try {
        // Check for error parameters first
        const error = searchParams.get("error")
        const errorCode = searchParams.get("error_code")
        const errorDescription = searchParams.get("error_description")

        if (error) {
          console.error("Magic link error:", { error, errorCode, errorDescription })
          setStatus("error")

          if (errorCode === "otp_expired") {
            setMessage("Magic link has expired. Please request a new one.")
          } else {
            setMessage(errorDescription || "Magic link verification failed.")
          }
          return
        }

        // Handle successful magic link callback
        const { data, error: authError } = await supabase.auth.getSession()

        if (authError) {
          console.error("Session error:", authError)
          setStatus("error")
          setMessage(authError.message)
          return
        }

        if (data.session && data.session.user) {
          setStatus("success")
          setMessage("Successfully signed in with magic link!")

          // Store user session
          localStorage.setItem("user", JSON.stringify(data.session.user))

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          // Try to get the session again after a short delay
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession()

            if (retryError) {
              setStatus("error")
              setMessage("Failed to establish session. Please try again.")
              return
            }

            if (retryData.session && retryData.session.user) {
              setStatus("success")
              setMessage("Successfully signed in with magic link!")
              localStorage.setItem("user", JSON.stringify(retryData.session.user))
              setTimeout(() => {
                router.push("/dashboard")
              }, 2000)
            } else {
              setStatus("error")
              setMessage("No active session found. Please try signing in again.")
            }
          }, 1000)
        }
      } catch (error: any) {
        console.error("Callback error:", error)
        setStatus("error")
        setMessage(error.message || "An error occurred during sign in")
      }
    }

    handleMagicLinkCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/images/alien-shipper-logo.png"
              alt="AlienShipper"
              width={200}
              height={60}
              className="h-12 w-auto"
            />
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              {status === "loading" && (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              )}
              {status === "error" && (
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {status === "loading" && "Signing You In..."}
              {status === "success" && "Welcome Back!"}
              {status === "error" && "Sign In Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">{message}</p>

            {status === "success" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/magic-link")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
              <CardContent className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <MagicLinkCallbackContent />
    </Suspense>
  )
}
