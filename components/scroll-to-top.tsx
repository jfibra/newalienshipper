"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 group"
          aria-label="Scroll to top"
        >
          <div className="w-8 h-8 mx-auto">
            <Image
              src="/icons/scroll-to-top.svg"
              alt="Scroll to top"
              width={32}
              height={32}
              className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </button>
      )}
    </>
  )
}
