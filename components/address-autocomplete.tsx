"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useAddressAutocomplete } from "@/hooks/use-address-autocomplete"
import { cn } from "@/lib/utils"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (address: any) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing an address...",
  className,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { suggestions, isLoading, error, search, clearSuggestions } = useAddressAutocomplete()

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    search(newValue)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  const handleSelect = (suggestion: any) => {
    onChange(suggestion.display_name)
    onSelect?.(suggestion)
    setIsOpen(false)
    clearSuggestions()
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleBlur = () => {
    // Delay closing to allow for click events
    setTimeout(() => {
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      selectedElement?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  const showSuggestions = isOpen && (suggestions.length > 0 || isLoading || error)

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.length >= 3 && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && <div className="px-3 py-2 text-sm text-gray-500">Searching addresses...</div>}

          {error && <div className="px-3 py-2 text-sm text-red-500">{error}</div>}

          {suggestions.length > 0 && (
            <ul ref={listRef} className="py-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100",
                    selectedIndex === index && "bg-gray-100",
                  )}
                  onClick={() => handleSelect(suggestion)}
                >
                  <div className="font-medium">{suggestion.display_name}</div>
                </li>
              ))}
            </ul>
          )}

          {!isLoading && !error && suggestions.length === 0 && value.length >= 3 && (
            <div className="px-3 py-2 text-sm text-gray-500">No addresses found</div>
          )}
        </div>
      )}
    </div>
  )
}
