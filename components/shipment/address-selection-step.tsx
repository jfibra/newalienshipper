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

  const renderAddressCard = (
    address: ShippingAddress | RecipientAddress,
    type: "from" | "to" | "return",
    isSelected: boolean,
  ) => {
    const isShipping = "address_line1" in address
    const street = isShipping ? address.address_line1 : (address as RecipientAddress).street1
    const street2 = isShipping ? address.address_line2 : (address as RecipientAddress).street2

    return (
      <Card
        key={address.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary bg-primary/5" : ""
        }`}
        onClick={() => handleAddressSelect(type, address)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {address.address_type === "commercial" ? (
                <Building className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Home className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{address.full_name}</span>
            </div>
            {address.is_default && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>{street}</div>
            {street2 && <div>{street2}</div>}
            <div>
              {address.city}, {address.state} {address.postal_code}
            </div>
            <div>{address.country}</div>
          </div>

          {address.company && (
            <div className="text-sm text-muted-foreground mt-2">
              <strong>Company:</strong> {address.company}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {address.address_type}
            </Badge>
            {isShipping && (
              <Badge variant="outline" className="text-xs">
                {(address as ShippingAddress).usage_type}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

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

      {/* From Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            From Address
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleAddNewAddress("from")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {shippingAddresses.map((address) =>
            renderAddressCard(address, "from", shipmentData.fromAddress?.id === address.id),
          )}
        </div>
      </div>

      {/* To Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            To Address
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleAddNewAddress("to")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {recipientAddresses.map((address) =>
            renderAddressCard(address, "to", shipmentData.toAddress?.id === address.id),
          )}
        </div>
      </div>

      {/* Return Address */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Return Address
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleAddNewAddress("return")}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {shippingAddresses.map((address) =>
            renderAddressCard(address, "return", shipmentData.returnAddress?.id === address.id),
          )}
        </div>
      </div>

      {/* Address Form Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Add New {addressDialogType === "from" || addressDialogType === "return" ? "Shipping" : "Recipient"}{" "}
              Address
            </DialogTitle>
          </DialogHeader>
          <AddressForm
            type={addressDialogType === "to" ? "recipient" : "shipping"}
            countries={countries}
            onSubmit={handleAddressSubmit}
            onCancel={() => setIsAddressDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Summary */}
      {canProceed && (
        <Card className="bg-muted/50">
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
