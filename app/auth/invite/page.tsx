"use client"
import { useState, useEffect, Suspense } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, Shield } from "lucide-react"

function InviteForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const accessToken = params.get("access_token")

  useEffect(() => {
    if (!accessToken) {
      setError("Invalid invitation link. Please check your email for the correct link.")
    }
  }, [accessToken])

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number"
    }
    return null
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!accessToken) {
      setError("Invalid invitation link.")
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to set password")

      setSuccess("Welcome! Your account has been set up successfully. Redirecting to dashboard...")
      setTimeout(() => router.replace("/dashboard"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to set password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[@$!%*?&])/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <form onSubmit={handleSetPassword} className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to AlienShipper!
            </h1>
            <p className="text-gray-600 mt-2">Set your password to complete your account setup</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {success}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : "Too weak"}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && password !== confirm && <p className="text-xs text-red-600 mt-1">Passwords do not match</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading || !accessToken || password !== confirm || passwordStrength < 3}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Setting up your account...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" />
                Complete Account Setup
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By setting your password, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Loading...
                </h1>
                <p className="text-gray-600 mt-2">Setting up your account</p>
              </div>

              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <InviteForm />
    </Suspense>
  )
}
