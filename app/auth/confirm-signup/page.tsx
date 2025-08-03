"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

function ConfirmSignupContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })

          if (error) {
            setStatus("error")
            setMessage(error.message)
          } else {
            setStatus("success")
            setMessage("Your email has been confirmed successfully!")

            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push("/login?confirmed=1")
            }, 3000)
          }
        } else {
          setStatus("success")
          setMessage("Email confirmation completed!")

          setTimeout(() => {
            router.push("/login?confirmed=1")
          }, 2000)
        }
      } catch (error: any) {
        setStatus("error")
        setMessage(error.message || "An error occurred during confirmation")
      }
    }

    handleEmailConfirmation()
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
              {status === "loading" && "Confirming Email..."}
              {status === "success" && "Email Confirmed!"}
              {status === "error" && "Confirmation Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">{message}</p>

            {status === "success" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            {status === "error" && (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Go to Login
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmSignupPage() {
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
      <ConfirmSignupContent />
    </Suspense>
  )
}
