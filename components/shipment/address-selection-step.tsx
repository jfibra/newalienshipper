"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Plus, Building, Home } from "lucide-react"
import { AddressForm } from "@/components/address-form"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { RecipientAddress, ShippingAddress, Country } from "@/lib/types/address"

interface AddressSelectionStepProps {
  user: any
  shipmentData: any
  onUpdate: (data: any) => void
  onNext: () => void
  isLoading: boolean
}

export function AddressSelectionStep({ user, shipmentData, onUpdate, onNext, isLoading }: AddressSelectionStepProps) {
  const { toast } = useToast()
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([])
  const [recipientAddresses, setRecipientAddresses] = useState<RecipientAddress[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [addressDialogType, setAddressDialogType] = useState<"from" | "to" | "return">("from")
  const [tag, setTag] = useState(shipmentData.tag || "")

  useEffect(() => {
    if (user) {
      loadAddresses()
      loadCountries()
    }
  }, [user])

  const loadAddresses = async () => {
    try {
      // Load shipping addresses
      const { data: shippingData, error: shippingError } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (shippingError) throw shippingError
      setShippingAddresses(shippingData || [])

      // Load recipient addresses
      const { data: recipientData, error: recipientError } = await supabase
        .from("recipient_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (recipientError) throw recipientError
      setRecipientAddresses(recipientData || [])
    } catch (error) {
      console.error("Error loading addresses:", error)
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      })
    }
  }

  const loadCountries = async () => {
    try {
      const response = await fetch("/countries.json")
      const data = await response.json()
      setCountries(data)
    } catch (error) {
      console.error("Error loading countries:", error)
    }
  }

  const handleAddressSelect = (type: "from" | "to" | "return", address: ShippingAddress | RecipientAddress) => {
    const updates: any = {}

    if (type === "from") {
      updates.fromAddress = address
      // Auto-select return address as same as from address
      if (!shipmentData.returnAddress) {
        updates.returnAddress = address
      }
    } else if (type === "to") {
      updates.toAddress = address
    } else if (type === "return") {
      updates.returnAddress = address
    }

    onUpdate(updates)
  }

  const handleAddNewAddress = (type: "from" | "to" | "return") => {
    setAddressDialogType(type)
    setIsAddressDialogOpen(true)
  }

  const handleAddressSubmit = async (addressData: any) => {
    try {
      const isShippingAddress = addressDialogType === "from" || addressDialogType === "return"
      const tableName = isShippingAddress ? "shipping_addresses" : "recipient_addresses"

      const { data, error } = await supabase
        .from(tableName)
        .insert([{ ...addressData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error

      // Update local state
      if (isShippingAddress) {
        setShippingAddresses((prev) => [...prev, data])
      } else {
        setRecipientAddresses((prev) => [...prev, data])
      }

      // Auto-select the new address
      handleAddressSelect(addressDialogType, data)
      setIsAddressDialogOpen(false)

      toast({
        title: "Success",
        description: "Address added successfully",
      })
    } catch (error) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive",
      })
    }
  }

  // Remove renderAddressCard, will use dropdowns instead

  const canProceed = shipmentData.fromAddress && shipmentData.toAddress

  return (
    <div className="space-y-6">
      {/* Optional Tag */}
      <div>
        <Label htmlFor="tag">Shipment Tag (Optional)</Label>
        <Input
          id="tag"
          placeholder="e.g., Order #12345, Gift for Mom"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value)
            onUpdate({ tag: e.target.value })
          }}
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">Add a custom reference to help you identify this shipment</p>
      </div>

      {/* Grouped Shipping From & Return Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping From Address */}
        <div>
          <Label htmlFor="fromAddress">Shipping From Address</Label>
          {shipmentData.fromAddress ? (
            <div className="flex items-center gap-2 mt-2">
              <span>{shipmentData.fromAddress.full_name}</span>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ fromAddress: undefined })}>
                Change
              </Button>
            </div>
          ) : (
            <select
              id="fromAddress"
              className="mt-2 w-full border rounded p-2"
              value={shipmentData.fromAddress?.id || ""}
              onChange={e => {
                const selected = shippingAddresses.find(addr => addr.id === e.target.value)
                if (selected) onUpdate({ fromAddress: selected })
              }}
            >
              <option value="">Select from your saved addresses</option>
              {shippingAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>{addr.full_name} - {addr.address_line1}</option>
              ))}
            </select>
          )}
        </div>
        {/* Return Address */}
        <div>
          <Label htmlFor="returnAddress">Return Address</Label>
          {shipmentData.returnAddress ? (
            <div className="flex items-center gap-2 mt-2">
              <span>{shipmentData.returnAddress.full_name}</span>
              <Button size="sm" variant="outline" onClick={() => onUpdate({ returnAddress: undefined })}>
                Change
              </Button>
            </div>
          ) : (
            <select
              id="returnAddress"
              className="mt-2 w-full border rounded p-2"
              value={shipmentData.returnAddress?.id || ""}
              onChange={e => {
                const selected = shippingAddresses.find(addr => addr.id === e.target.value)
                if (selected) onUpdate({ returnAddress: selected })
              }}
            >
              <option value="">Select from your saved addresses</option>
              {shippingAddresses.map(addr => (
                <option key={addr.id} value={addr.id}>{addr.full_name} - {addr.address_line1}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* To Address (Recipient) */}
      <div>
        <Label htmlFor="toAddress">Recipient Address</Label>
        {shipmentData.toAddress ? (
          <div className="flex items-center gap-2 mt-2">
            <span>{shipmentData.toAddress.full_name}</span>
            <Button size="sm" variant="outline" onClick={() => onUpdate({ toAddress: undefined })}>
              Change
            </Button>
          </div>
        ) : (
          <select
            id="toAddress"
            className="mt-2 w-full border rounded p-2"
            value={shipmentData.toAddress?.id || ""}
            onChange={e => {
              const selected = recipientAddresses.find(addr => addr.id === e.target.value)
              if (selected) onUpdate({ toAddress: selected })
            }}
          >
            <option value="">Select from your saved recipient addresses</option>
            {recipientAddresses.map(addr => (
              <option key={addr.id} value={addr.id}>{addr.full_name} - {addr.street1}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary */}
      {canProceed && (
        <Card className="bg-muted/50 mt-6">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Selected Addresses:</h4>
            <div className="text-sm space-y-1">
              <div>
                <strong>From:</strong> {shipmentData.fromAddress?.full_name}
              </div>
              <div>
                <strong>To:</strong> {shipmentData.toAddress?.full_name}
              </div>
              <div>
                <strong>Return:</strong> {shipmentData.returnAddress?.full_name}
              </div>
              {tag && (
                <div>
                  <strong>Tag:</strong> {tag}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
