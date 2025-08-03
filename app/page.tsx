"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Zap, Globe, Shield, Bell, MapPin, BarChart3, ArrowRight } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle URL search parameters first (from Supabase redirects)
    const token = searchParams.get("token")
    const type = searchParams.get("type")
    const error = searchParams.get("error")
    const access_token = searchParams.get("access_token")
    const refresh_token = searchParams.get("refresh_token")

    // Handle password reset callback with token in URL params
    if (token && type === "recovery") {
      console.log("Password reset token detected in URL params:", token)
      router.replace(`/auth/reset-password?access_token=${token}&type=${type}`)
      return
    }

    // Handle other auth tokens in URL params
    if (access_token && refresh_token) {
      console.log("Auth tokens detected in URL params")
      router.replace(`/auth/reset-password?access_token=${access_token}&refresh_token=${refresh_token}&type=recovery`)
      return
    }

    // Check for auth tokens in URL hash (Supabase sometimes puts them there)
    const hash = window.location.hash
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1))
      const hashAccessToken = hashParams.get("access_token")
      const hashRefreshToken = hashParams.get("refresh_token")
      const hashTokenType = hashParams.get("token_type")
      const hashType = hashParams.get("type")
      const expiresAt = hashParams.get("expires_at")
      const expiresIn = hashParams.get("expires_in")

      // Handle password reset callback from hash
      if (hashAccessToken && (hashType === "recovery" || hashTokenType === "bearer")) {
        console.log("Password reset token detected in URL hash:", hashAccessToken)

        // Build the redirect URL with all necessary parameters
        const resetUrl = new URL("/auth/reset-password", window.location.origin)
        resetUrl.searchParams.set("access_token", hashAccessToken)
        if (hashRefreshToken) resetUrl.searchParams.set("refresh_token", hashRefreshToken)
        if (hashTokenType) resetUrl.searchParams.set("token_type", hashTokenType)
        resetUrl.searchParams.set("type", "recovery")
        if (expiresAt) resetUrl.searchParams.set("expires_at", expiresAt)
        if (expiresIn) resetUrl.searchParams.set("expires_in", expiresIn)

        // Clear the hash and redirect
        window.history.replaceState(null, "", window.location.pathname)
        router.replace(resetUrl.toString())
        return
      }

      // Only handle actual errors in hash, not valid tokens
      const hashError = hashParams.get("error")
      const errorCode = hashParams.get("error_code")
      const errorDescription = hashParams.get("error_description")

      if (hashError && hashError !== "access_denied") {
        console.log("Auth error detected in hash:", hashError, errorCode, errorDescription)
        if (errorCode === "otp_expired") {
          router.replace(
            `/forgot-password?error=expired&message=${encodeURIComponent("Password reset link has expired. Please request a new one.")}`,
          )
          return
        }
      }
    }

    // Handle URL parameter errors (but be more specific)
    if (error && error !== "access_denied") {
      console.log("Auth error detected in URL params:", error)
      if (error === "otp_expired") {
        router.replace(
          `/forgot-password?error=expired&message=${encodeURIComponent("Password reset link has expired. Please request a new one.")}`,
        )
        return
      }
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Ship Packages at{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                    Warp Speed
                  </span>{" "}
                  with Alien Technology
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Experience intergalactic shipping solutions that are truly out of this world. Save up to 89% on USPS &
                  UPS rates with our advanced alien technology.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-4">
                  Launch Your Savings
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
                  View Cosmic Rates
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">No setup fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">No monthly fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">24/7 alien support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/images/alien-delivery-ship.png"
                alt="Alien ship delivering packages"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-2 hover:border-purple-200 transition-colors">
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-purple-600">89%</div>
                <div className="text-xl font-semibold text-gray-900">Off USPS & UPS Rates</div>
                <p className="text-gray-600">Save more than any earthly shipping solution</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-2 hover:border-blue-200 transition-colors">
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-blue-600">⚡</div>
                <div className="text-xl font-semibold text-gray-900">Instant Quotes</div>
                <p className="text-gray-600">Get shipping rates faster than light speed</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-2 hover:border-green-200 transition-colors">
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-green-600">100%</div>
                <div className="text-xl font-semibold text-gray-900">Free</div>
                <p className="text-gray-600">No hidden fees, no monthly charges, ever</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Features from Another Galaxy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our alien technology provides shipping features that are truly out of this world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Zap className="w-12 h-12 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Batch Label Creation</h3>
                <p className="text-gray-600">
                  Create hundreds of shipping labels in seconds with our quantum processing
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Globe className="w-12 h-12 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">International Shipping</h3>
                <p className="text-gray-600">Ship to any planet in the galaxy with our intergalactic network</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Shield className="w-12 h-12 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">Shipping Insurance</h3>
                <p className="text-gray-600">Protect your packages with coverage that spans dimensions</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <Bell className="w-12 h-12 text-orange-600" />
                <h3 className="text-xl font-semibold text-gray-900">Tracking & Notifications</h3>
                <p className="text-gray-600">Real-time updates transmitted via quantum entanglement</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <MapPin className="w-12 h-12 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">Address Validation</h3>
                <p className="text-gray-600">Verify addresses across all known galaxies and dimensions</p>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <BarChart3 className="w-12 h-12 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Cost Reporting</h3>
                <p className="text-gray-600">Advanced analytics powered by alien artificial intelligence</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link href="/features">
                Explore All Features
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shipping Calculator Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cosmic Shipping Calculator</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Calculate shipping costs across the universe with our quantum-powered calculator
            </p>
          </div>

          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="text-center space-y-6">
              <div className="text-6xl mb-4">🛸</div>
              <h3 className="text-2xl font-semibold text-gray-900">Advanced Calculator Coming Soon</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our alien engineers are putting the finishing touches on the most advanced shipping calculator in the
                galaxy. Get instant quotes for any destination.
              </p>
              <Button size="lg" asChild>
                <Link href="/calculator">
                  Access Calculator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold">Ready to Launch Your Shipping into Orbit?</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join thousands of businesses already saving with AlienShipper. No setup fees, no monthly charges, just
              incredible savings from day one.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
