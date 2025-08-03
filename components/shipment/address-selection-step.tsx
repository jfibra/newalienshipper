"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { MapPin, Search, User } from "lucide-react"
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

interface AddressFormData {
  // Sender Info
  senderName: string
  senderEmail: string
  senderCompany: string
  senderPhone: string

  // Ship From Address
  fromCountry: string
  fromStreet1: string
  fromStreet2: string
  fromCity: string
  fromState: string
  fromPostalCode: string
  useAsReturn: boolean

  // Recipient Info
  recipientName: string
  recipientEmail: string
  recipientCompany: string
  recipientPhone: string
  saveRecipient: boolean

  // Recipient Address
  toCountry: string
  toStreet1: string
  toStreet2: string
  toCity: string
  toState: string
  toPostalCode: string
  isResidential: boolean

  // Optional tag
  tag: string
}

export function AddressSelectionStep({ user, shipmentData, onUpdate, onNext, isLoading }: AddressSelectionStepProps) {
  const { toast } = useToast()
  const [countries, setCountries] = useState<Country[]>([])
  const [savedRecipients, setSavedRecipients] = useState<RecipientAddress[]>([])
  const [savedShippingAddresses, setSavedShippingAddresses] = useState<ShippingAddress[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientAddress | null>(null)

  const [formData, setFormData] = useState<AddressFormData>({
    senderName: "",
    senderEmail: "",
    senderCompany: "",
    senderPhone: "",
    fromCountry: "US",
    fromStreet1: "",
    fromStreet2: "",
    fromCity: "",
    fromState: "",
    fromPostalCode: "",
    useAsReturn: true,
    recipientName: "",
    recipientEmail: "",
    recipientCompany: "",
    recipientPhone: "",
    saveRecipient: false,
    toCountry: "US",
    toStreet1: "",
    toStreet2: "",
    toCity: "",
    toState: "",
    toPostalCode: "",
    isResidential: true,
    tag: shipmentData.tag || "",
  })

  useEffect(() => {
    if (user) {
      loadUserData()
      loadSavedAddresses()
      loadCountries()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("first_name, last_name, email, phone, company")
        .eq("id", user.id)
        .single()

      if (error) throw error

      if (userData) {
        setFormData((prev) => ({
          ...prev,
          senderName: `${userData.first_name} ${userData.last_name}`.trim(),
          senderEmail: userData.email || "",
          senderCompany: userData.company || "",
          senderPhone: userData.phone || "",
        }))
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const loadSavedAddresses = async () => {
    try {
      // Load recipient addresses
      const { data: recipients, error: recipientError } = await supabase
        .from("recipient_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (recipientError) throw recipientError
      setSavedRecipients(recipients || [])

      // Load shipping addresses
      const { data: shipping, error: shippingError } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (shippingError) throw shippingError
      setSavedShippingAddresses(shipping || [])

      // Auto-fill with default shipping address if available
      const defaultShipping = shipping?.find((addr) => addr.is_default)
      if (defaultShipping) {
        setFormData((prev) => ({
          ...prev,
          fromCountry: defaultShipping.country_code,
          fromStreet1: defaultShipping.address_line1,
          fromStreet2: defaultShipping.address_line2 || "",
          fromCity: defaultShipping.city,
          fromState: defaultShipping.state,
          fromPostalCode: defaultShipping.postal_code,
        }))
      }
    } catch (error) {
      console.error("Error loading addresses:", error)
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

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRecipientSelect = (recipient: RecipientAddress) => {
    setSelectedRecipient(recipient)
    setFormData((prev) => ({
      ...prev,
      recipientName: recipient.full_name,
      recipientEmail: recipient.email || "",
      recipientCompany: recipient.company || "",
      recipientPhone: recipient.phone_number || "",
      toCountry: recipient.country_code,
      toStreet1: recipient.street1,
      toStreet2: recipient.street2 || "",
      toCity: recipient.city,
      toState: recipient.state,
      toPostalCode: recipient.postal_code,
      isResidential: recipient.address_type === "residential",
    }))
    setSearchQuery("")
  }

  const filteredRecipients = savedRecipients.filter(
    (recipient) =>
      recipient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = async () => {
    try {
      // Create from address object
      const fromAddress: ShippingAddress = {
        id: crypto.randomUUID(),
        user_id: user.id,
        full_name: formData.senderName,
        email: formData.senderEmail,
        phone: formData.senderPhone,
        company: formData.senderCompany,
        address_line1: formData.fromStreet1,
        address_line2: formData.fromStreet2,
        city: formData.fromCity,
        state: formData.fromState,
        postal_code: formData.fromPostalCode,
        country: countries.find((c) => c.code === formData.fromCountry)?.name || "United States",
        country_code: formData.fromCountry,
        address_type: "commercial",
        usage_type: "shipping",
      }

      // Create to address object
      const toAddress: RecipientAddress = {
        id: crypto.randomUUID(),
        user_id: user.id,
        full_name: formData.recipientName,
        email: formData.recipientEmail,
        phone_number: formData.recipientPhone,
        company: formData.recipientCompany,
        street1: formData.toStreet1,
        street2: formData.toStreet2,
        city: formData.toCity,
        state: formData.toState,
        postal_code: formData.toPostalCode,
        country: countries.find((c) => c.code === formData.toCountry)?.name || "United States",
        country_code: formData.toCountry,
        address_type: formData.isResidential ? "residential" : "commercial",
      }

      // Return address (same as from if useAsReturn is checked)
      const returnAddress = formData.useAsReturn ? fromAddress : fromAddress

      // Save recipient if requested and not already saved
      if (formData.saveRecipient && !selectedRecipient) {
        try {
          const { data, error } = await supabase
            .from("recipient_addresses")
            .insert([
              {
                user_id: user.id,
                full_name: formData.recipientName,
                email: formData.recipientEmail,
                phone_number: formData.recipientPhone,
                company: formData.recipientCompany,
                street1: formData.toStreet1,
                street2: formData.toStreet2,
                city: formData.toCity,
                state: formData.toState,
                postal_code: formData.toPostalCode,
                country: countries.find((c) => c.code === formData.toCountry)?.name || "United States",
                country_code: formData.toCountry,
                address_type: formData.isResidential ? "residential" : "commercial",
              },
            ])
            .select()
            .single()

          if (!error && data) {
            toAddress.id = data.id
          }
        } catch (error) {
          console.error("Error saving recipient:", error)
        }
      }

      onUpdate({
        fromAddress,
        toAddress,
        returnAddress,
        tag: formData.tag,
      })

      onNext()
    } catch (error) {
      console.error("Error processing addresses:", error)
      toast({
        title: "Error",
        description: "Failed to process addresses",
        variant: "destructive",
      })
    }
  }

  const isFormValid = () => {
    return (
      formData.senderName &&
      formData.senderEmail &&
      formData.fromStreet1 &&
      formData.fromCity &&
      formData.fromState &&
      formData.fromPostalCode &&
      formData.recipientName &&
      formData.toStreet1 &&
      formData.toCity &&
      formData.toState &&
      formData.toPostalCode
    )
  }

  return (
    <div className="space-y-8">
      {/* Optional Tag */}
      <div>
        <Label htmlFor="tag">Shipment Reference (Optional)</Label>
        <Input
          id="tag"
          placeholder="e.g., Order #12345, Gift for Mom"
          value={formData.tag}
          onChange={(e) => handleInputChange("tag", e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Sender Address Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Sender Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Name *</Label>
              <Input
                id="senderName"
                value={formData.senderName}
                onChange={(e) => handleInputChange("senderName", e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="senderCompany">Company</Label>
              <Input
                id="senderCompany"
                value={formData.senderCompany}
                onChange={(e) => handleInputChange("senderCompany", e.target.value)}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Email *</Label>
              <Input
                id="senderEmail"
                type="email"
                value={formData.senderEmail}
                onChange={(e) => handleInputChange("senderEmail", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="senderPhone">Phone *</Label>
              <Input
                id="senderPhone"
                value={formData.senderPhone}
                onChange={(e) => handleInputChange("senderPhone", e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Ship From</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fromCountry">Country *</Label>
                <Select value={formData.fromCountry} onValueChange={(value) => handleInputChange("fromCountry", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromStreet1">Street *</Label>
                  <Input
                    id="fromStreet1"
                    value={formData.fromStreet1}
                    onChange={(e) => handleInputChange("fromStreet1", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="fromStreet2">Street (line 2)</Label>
                  <Input
                    id="fromStreet2"
                    value={formData.fromStreet2}
                    onChange={(e) => handleInputChange("fromStreet2", e.target.value)}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fromCity">City *</Label>
                  <Input
                    id="fromCity"
                    value={formData.fromCity}
                    onChange={(e) => handleInputChange("fromCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="fromState">State *</Label>
                  <Input
                    id="fromState"
                    value={formData.fromState}
                    onChange={(e) => handleInputChange("fromState", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="fromPostalCode">Postal Code / ZIP *</Label>
                  <Input
                    id="fromPostalCode"
                    value={formData.fromPostalCode}
                    onChange={(e) => handleInputChange("fromPostalCode", e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useAsReturn"
                  checked={formData.useAsReturn}
                  onCheckedChange={(checked) => handleInputChange("useAsReturn", checked as boolean)}
                />
                <Label htmlFor="useAsReturn">Use as return address</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipient Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recipient Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Saved Recipients */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved recipients"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && filteredRecipients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleRecipientSelect(recipient)}
                  >
                    <div className="font-medium">{recipient.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {recipient.street1}, {recipient.city}, {recipient.state}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveRecipient"
              checked={formData.saveRecipient}
              onCheckedChange={(checked) => handleInputChange("saveRecipient", checked as boolean)}
            />
            <Label htmlFor="saveRecipient">Save recipient address</Label>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Contact Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Name *</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="recipientCompany">Company</Label>
                <Input
                  id="recipientCompany"
                  value={formData.recipientCompany}
                  onChange={(e) => handleInputChange("recipientCompany", e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label htmlFor="recipientEmail">Email</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={formData.recipientEmail}
                  onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="recipientPhone">Phone</Label>
                <Input
                  id="recipientPhone"
                  value={formData.recipientPhone}
                  onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Address</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="toCountry">Country *</Label>
                <Select value={formData.toCountry} onValueChange={(value) => handleInputChange("toCountry", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toStreet1">Street *</Label>
                  <Input
                    id="toStreet1"
                    value={formData.toStreet1}
                    onChange={(e) => handleInputChange("toStreet1", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="toStreet2">Street (line 2)</Label>
                  <Input
                    id="toStreet2"
                    value={formData.toStreet2}
                    onChange={(e) => handleInputChange("toStreet2", e.target.value)}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="toCity">City *</Label>
                  <Input
                    id="toCity"
                    value={formData.toCity}
                    onChange={(e) => handleInputChange("toCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="toState">State *</Label>
                  <Input
                    id="toState"
                    value={formData.toState}
                    onChange={(e) => handleInputChange("toState", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="toPostalCode">Postal Code / ZIP *</Label>
                  <Input
                    id="toPostalCode"
                    value={formData.toPostalCode}
                    onChange={(e) => handleInputChange("toPostalCode", e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isResidential"
                  checked={formData.isResidential}
                  onCheckedChange={(checked) => handleInputChange("isResidential", checked as boolean)}
                />
                <Label htmlFor="isResidential">This is a residential address</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!isFormValid() || isLoading} size="lg">
          Continue to Package Details
        </Button>
      </div>
    </div>
  )
}
