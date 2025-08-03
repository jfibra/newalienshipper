"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserSession } from "@/hooks/use-user-session"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Calculator", href: "/calculator" },
    { name: "Contact", href: "/contact" },
  ]

  const { user, loading } = useUserSession()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return

    setIsSigningOut(true)
    setShowDropdown(false)

    try {
      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear any additional session data
      await fetch("/api/logout", { method: "POST" })

      // Clear local storage
      localStorage.removeItem("user")

      // Force redirect to login
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
      // Force redirect even if there's an error
      router.push("/login")
    } finally {
      setIsSigningOut(false)
    }
  }

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/android-chrome-192x192.png" alt="AlienShipper" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">AlienShipper</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full"
                  onClick={() => setShowDropdown(!showDropdown)}
                  aria-label="User menu"
                  disabled={isSigningOut}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                      alt={user.email || "User"}
                    />
                    <AvatarFallback className="bg-purple-600 text-white text-sm">
                      {user.email ? getUserInitials(user.email) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">{user.email}</div>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {isSigningOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button asChild variant="outline" className="mr-2 bg-transparent">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {loading ? (
                <div className="px-2 py-1">
                  <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <>
                  <div className="px-2 py-1 text-sm text-gray-500 border-t border-gray-200 pt-4">{user.email}</div>
                  <Button
                    variant="ghost"
                    className="mx-2 justify-start"
                    onClick={() => {
                      setIsMenuOpen(false)
                      router.push("/dashboard")
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="mx-2 justify-start"
                    onClick={async () => {
                      setIsMenuOpen(false)
                      await handleSignOut()
                    }}
                    disabled={isSigningOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="mx-2 mt-4 bg-transparent">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="mx-2 mt-2">
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
