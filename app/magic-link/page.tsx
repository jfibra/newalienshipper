"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, Zap, CheckCircle, ArrowLeft } from "lucide-react"

export default function MagicLinkPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const response = await fetch("/api/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link")
      }

      if (data.success) {
        setSuccess("Magic link sent! Check your inbox and click the link to sign in.")
      } else {
        throw new Error(data.error || "Failed to send magic link")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send magic link")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <h1 className="text-3xl font-bold text-gray-900">Magic Link Login</h1>
          <p className="text-gray-600 mt-2">Get instant access without a password</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-gray-900">Magic Link</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your email and we'll send you a secure login link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleMagicLink} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• We'll send a secure link to your email</li>
                      <li>• Click the link to sign in instantly</li>
                      <li>• No password required - it's that simple!</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link
                href="/login"
                className="flex items-center text-purple-600 hover:text-purple-500 font-medium transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/signup" className="text-purple-600 hover:text-purple-500 font-medium transition-colors">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
