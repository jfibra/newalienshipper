"use client"
import { useState, Suspense } from "react"
import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from "lucide-react"

function ResetPasswordForm() {
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

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!password) {
      setError("Password is required.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    if (!accessToken) {
      setError("Invalid reset link. Please request a new password reset.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reset password")
      setSuccess("Password reset successfully! Redirecting to login...")
      setTimeout(() => router.replace("/login?message=Password reset successfully"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Password strength: {strengthLabels[passwordStrength - 1] || "Very Weak"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pr-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {confirm && password !== confirm && <p className="text-xs text-red-600">Passwords do not match</p>}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading || !password || !confirm || password !== confirm}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Resetting Password...
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <button onClick={() => router.push("/login")} className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto w-48"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-64"></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
