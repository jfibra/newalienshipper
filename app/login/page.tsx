"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, Loader2, Rocket, CheckCircle, AlertTriangle } from "lucide-react"
import { useUserSession } from "@/hooks/use-user-session"

// Rate limiting configuration
const RATE_LIMIT_DELAY = 60000 // 1 minute
const MAX_ATTEMPTS = 3
const RETRY_DELAYS = [1000, 3000, 5000] // Progressive delays for retries

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [success, setSuccess] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading } = useUserSession()
  const supabase = createClientComponentClient()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const confirmed = searchParams.get("confirmed")
    if (confirmed === "1") {
      setSuccess("Email confirmed successfully! You can now sign in.")
    }
  }, [searchParams])

  // Rate limit timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRateLimited && rateLimitEndTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max(0, rateLimitEndTime - now)
        setTimeRemaining(Math.ceil(remaining / 1000))

        if (remaining <= 0) {
          setIsRateLimited(false)
          setRateLimitEndTime(null)
          setAttemptCount(0)
          setError("")
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRateLimited, rateLimitEndTime])

  // Helper function to handle rate limiting
  const handleRateLimit = useCallback(() => {
    const newAttemptCount = attemptCount + 1
    setAttemptCount(newAttemptCount)

    if (newAttemptCount >= MAX_ATTEMPTS) {
      setIsRateLimited(true)
      setRateLimitEndTime(Date.now() + RATE_LIMIT_DELAY)
      setError(`Too many login attempts. Please wait ${RATE_LIMIT_DELAY / 1000} seconds before trying again.`)
    }
  }, [attemptCount])

  // Retry function with exponential backoff
  const retryWithBackoff = useCallback(async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        const isRateLimitError =
          error.message?.toLowerCase().includes("rate limit") ||
          error.message?.toLowerCase().includes("too many requests")

        if (isRateLimitError && attempt < maxRetries - 1) {
          const delay = RETRY_DELAYS[attempt] || 5000
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw error
      }
    }
  }, [])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isRateLimited) {
      setError(`Please wait ${timeRemaining} seconds before trying again.`)
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const loginOperation = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        return data
      }

      const data = await retryWithBackoff(loginOperation)

      if (data.user) {
        // Reset attempt count on successful login
        setAttemptCount(0)
        setIsRateLimited(false)
        setRateLimitEndTime(null)

        // The auth state change will be handled by the useUserSession hook
        // and middleware will handle the redirect
        router.refresh()
      }
    } catch (err: any) {
      console.error("Login error:", err)

      const errorMessage = err.message || "An error occurred during login"
      const isRateLimitError =
        errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("too many requests")

      if (isRateLimitError) {
        handleRateLimit()
        setError(
          "Too many login attempts. Please wait a moment before trying again, or use the magic link option below.",
        )
      } else {
        setError(errorMessage)
        // Only increment attempt count for actual failed login attempts, not rate limits
        if (!errorMessage.toLowerCase().includes("invalid")) {
          handleRateLimit()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    if (isRateLimited) {
      setError(`Please wait ${timeRemaining} seconds before trying again.`)
      return
    }

    setIsMagicLinkLoading(true)
    setError("")
    setSuccess("")

    try {
      const magicLinkOperation = async () => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/magic-link-callback`,
          },
        })

        if (error) throw error
      }

      await retryWithBackoff(magicLinkOperation)
      setMagicLinkSent(true)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send magic link"
      const isRateLimitError =
        errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("too many requests")

      if (isRateLimitError) {
        handleRateLimit()
        setError("Too many requests. Please wait a moment before requesting another magic link.")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsMagicLinkLoading(false)
    }
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Don't render if user is already logged in (will redirect)
  if (user) {
    return null
  }

  if (magicLinkSent) {
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
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
              <CardDescription className="text-gray-600">We've sent you a magic link to sign in</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  We've sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in
                  instantly.
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">The magic link will expire in 1 hour for security.</p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setMagicLinkSent(false)}
                    className="w-full bg-transparent border-2 hover:bg-gray-50"
                  >
                    Try Different Email
                  </Button>
                  <p className="text-xs text-gray-500">Didn't receive the email? Check your spam folder.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your cosmic shipping account</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
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
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isRateLimited && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Rate limit active. Please wait {timeRemaining} seconds before trying again.
                  {timeRemaining > 30 && (
                    <div className="mt-2">
                      <span className="text-sm">Try using the magic link option below instead.</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                    required
                    disabled={isLoading || isRateLimited}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                    required
                    disabled={isLoading || isRateLimited}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading || isRateLimited}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-purple-600 hover:text-purple-500 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                {attemptCount > 0 && !isRateLimited && (
                  <div className="text-xs text-orange-600">{MAX_ATTEMPTS - attemptCount} attempts remaining</div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : isRateLimited ? (
                  <>
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Wait {timeRemaining}s
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleMagicLink}
              disabled={isMagicLinkLoading || !email || isLoading}
              className="w-full h-12 bg-transparent border-2 border-gray-200 hover:bg-gray-50 hover:border-purple-300 transition-all duration-200"
            >
              {isMagicLinkLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Send Magic Link
                  {isRateLimited && <span className="ml-2 text-xs text-green-600">(Recommended)</span>}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-600 hover:text-purple-500 font-semibold transition-colors">
                Sign up for free
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
