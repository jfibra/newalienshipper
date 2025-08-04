"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { MapPin, Search, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Swal from "sweetalert2"
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

  // Return Address (if not useAsReturn)
  returnStreet1?: string
  returnStreet2?: string
  returnCity?: string
  returnState?: string
  returnPostalCode?: string

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
  addressType?: string

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

  const [formData, setFormData] = useState<AddressFormData>(() => ({
    senderName: shipmentData.fromAddress?.full_name || "",
    senderEmail: shipmentData.fromAddress?.email || "",
    senderCompany: shipmentData.fromAddress?.company || "",
    senderPhone: shipmentData.fromAddress?.phone || "",
    fromCountry: shipmentData.fromAddress?.country_code || "US",
    fromStreet1: shipmentData.fromAddress?.address_line1 || "",
    fromStreet2: shipmentData.fromAddress?.address_line2 || "",
    fromCity: shipmentData.fromAddress?.city || "",
    fromState: shipmentData.fromAddress?.state || "",
    fromPostalCode: shipmentData.fromAddress?.postal_code || "",
    useAsReturn: true,
    recipientName: shipmentData.toAddress?.full_name || "",
    recipientEmail: shipmentData.toAddress?.email || "",
    recipientCompany: shipmentData.toAddress?.company || "",
    recipientPhone: shipmentData.toAddress?.phone_number || "",
    saveRecipient: false,
    toCountry: shipmentData.toAddress?.country_code || "US",
    toStreet1: shipmentData.toAddress?.street1 || "",
    toStreet2: shipmentData.toAddress?.street2 || "",
    toCity: shipmentData.toAddress?.city || "",
    toState: shipmentData.toAddress?.state || "",
    toPostalCode: shipmentData.toAddress?.postal_code || "",
    isResidential: shipmentData.toAddress?.address_type === "residential" || true,
    tag: shipmentData.tag || "",
  }))

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

  // Handle autofill from dropdown for sender
  const handleSenderDropdown = (id: string) => {
    const selected = savedShippingAddresses.find(addr => addr.id === id)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        senderName: selected.full_name,
        senderEmail: selected.email || "",
        senderCompany: selected.company || "",
        senderPhone: selected.phone || "",
        fromCountry: selected.country_code,
        fromStreet1: selected.address_line1,
        fromStreet2: selected.address_line2 || "",
        fromCity: selected.city,
        fromState: selected.state,
        fromPostalCode: selected.postal_code,
      }))
    }
  }

  // Handle autofill from dropdown for recipient
  const handleRecipientDropdown = (id: string) => {
    const selected = savedRecipients.find(addr => addr.id === id)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        recipientName: selected.full_name,
        recipientEmail: selected.email || "",
        recipientCompany: selected.company || "",
        recipientPhone: selected.phone_number || "",
        toCountry: selected.country_code,
        toStreet1: selected.street1,
        toStreet2: selected.street2 || "",
        toCity: selected.city,
        toState: selected.state,
        toPostalCode: selected.postal_code,
        isResidential: selected.address_type === "residential",
        addressType: selected.address_type || "residential"
      }))
    }
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
      // Helper: check for duplicate address in a table
      type Field = { key: string; value: string | undefined }
      const findDuplicate = async (table: string, fields: Field[]) => {
        let query = supabase.from(table).select("*").eq("user_id", user.id)
        for (const field of fields) {
          query = query.eq(field.key, field.value)
        }
        const { data, error } = await query
        if (error) return null
        return data && data.length > 0 ? data[0] : null
      }

      // Prepare sender (from) address fields for duplicate check
      const fromFields = [
        { key: "full_name", value: formData.senderName },
        { key: "email", value: formData.senderEmail },
        { key: "phone", value: formData.senderPhone },
        { key: "company", value: formData.senderCompany },
        { key: "address_line1", value: formData.fromStreet1 },
        { key: "city", value: formData.fromCity },
        { key: "state", value: formData.fromState },
        { key: "postal_code", value: formData.fromPostalCode },
      ]
      let fromAddress = null
      fromAddress = await findDuplicate("shipping_addresses", fromFields)
      if (!fromAddress) {
        // Insert new sender address
        const { data, error } = await supabase
          .from("shipping_addresses")
          .insert([
            {
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
            },
          ])
          .select()
          .single()
        if (error) throw error
        fromAddress = data
        toast({ title: "Sender address saved!", description: "Your sender address was saved to your address book." })
      } else {
        toast({ title: "Sender address matched!", description: "Using your saved sender address." })
      }

      // Prepare recipient (to) address fields for duplicate check
      const toFields = [
        { key: "full_name", value: formData.recipientName },
        { key: "email", value: formData.recipientEmail },
        { key: "phone_number", value: formData.recipientPhone },
        { key: "company", value: formData.recipientCompany },
        { key: "street1", value: formData.toStreet1 },
        { key: "city", value: formData.toCity },
        { key: "state", value: formData.toState },
        { key: "postal_code", value: formData.toPostalCode },
      ]
      let toAddress = null
      toAddress = await findDuplicate("recipient_addresses", toFields)
      if (!toAddress) {
        // Insert new recipient address
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
        if (error) throw error
        toAddress = data
        toast({ title: "Recipient address saved!", description: "Your recipient address was saved to your address book." })
      } else {
        toast({ title: "Recipient address matched!", description: "Using your saved recipient address." })
      }

      // Handle return address if entered separately (not useAsReturn)
      let returnAddress = fromAddress
      if (!formData.useAsReturn && formData.returnStreet1) {
        // Check for duplicate in recipient_addresses with usage_type 'return'
        const returnFields = [
          { key: "full_name", value: formData.senderName },
          { key: "email", value: formData.senderEmail },
          { key: "phone_number", value: formData.senderPhone },
          { key: "company", value: formData.senderCompany },
          { key: "street1", value: formData.returnStreet1 },
          { key: "city", value: formData.returnCity },
          { key: "state", value: formData.returnState },
          { key: "postal_code", value: formData.returnPostalCode },
        ]
        let returnRecipient = await findDuplicate("recipient_addresses", returnFields)
        if (!returnRecipient) {
          // Insert as recipient address with usage_type 'return'
          const { data, error } = await supabase
            .from("recipient_addresses")
            .insert([
              {
                user_id: user.id,
                full_name: formData.senderName,
                email: formData.senderEmail,
                phone_number: formData.senderPhone,
                company: formData.senderCompany,
                street1: formData.returnStreet1,
                street2: formData.returnStreet2,
                city: formData.returnCity,
                state: formData.returnState,
                postal_code: formData.returnPostalCode,
                country: countries.find((c) => c.code === formData.fromCountry)?.name || "United States",
                country_code: formData.fromCountry,
                address_type: "commercial",
                usage_type: "return",
              },
            ])
            .select()
            .single()
          if (error) throw error
          returnRecipient = data
          toast({ title: "Return address saved!", description: "Your return address was saved to your address book." })
        } else {
          toast({ title: "Return address matched!", description: "Using your saved return address." })
        }
        returnAddress = returnRecipient
      }

      onUpdate({
        fromAddress,
        toAddress,
        returnAddress,
        tag: formData.tag,
      })

      // SweetAlert2 confirmation
      await Swal.fire({
        icon: "success",
        title: "Addresses Confirmed",
        text: "You have confirmed the addresses above are correct. We will save this information for your shipment.",
        confirmButtonText: "Continue",
        customClass: { popup: "max-w-md" },
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
                <AddressAutocomplete
                  value={formData.fromStreet1}
                  onChange={val => handleInputChange("fromStreet1", val)}
                  onSelect={suggestion => {
                    if (suggestion && suggestion.address) {
                      const street = [suggestion.address.house_number, suggestion.address.road].filter(Boolean).join(" ");
                      handleInputChange("fromStreet1", street);
                      if (suggestion.address.city) handleInputChange("fromCity", suggestion.address.city);
                      if (suggestion.address.state) handleInputChange("fromState", suggestion.address.state);
                      if (suggestion.address.postcode) handleInputChange("fromPostalCode", suggestion.address.postcode);
                      if (suggestion.address.country_code) handleInputChange("fromCountry", suggestion.address.country_code.toUpperCase());
                    } else if (typeof suggestion === "string") {
                      handleInputChange("fromStreet1", suggestion);
                    } else if (suggestion && suggestion.display_name) {
                      handleInputChange("fromStreet1", suggestion.display_name);
                    }
                  }}
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

          {/* Show return address form if unchecked */}
          {!formData.useAsReturn && (
            <div className="mt-6 p-4 border rounded">
              <h4 className="font-medium mb-3">Return Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="returnStreet1">Street *</Label>
                  <AddressAutocomplete
                    value={formData.returnStreet1 || ""}
                    onChange={val => handleInputChange("returnStreet1", val)}
                    onSelect={suggestion => {
                      if (suggestion && suggestion.address) {
                        const street = [suggestion.address.house_number, suggestion.address.road].filter(Boolean).join(" ");
                        handleInputChange("returnStreet1", street);
                        if (suggestion.address.city) handleInputChange("returnCity", suggestion.address.city);
                        if (suggestion.address.state) handleInputChange("returnState", suggestion.address.state);
                        if (suggestion.address.postcode) handleInputChange("returnPostalCode", suggestion.address.postcode);
                        if (suggestion.address.country_code) handleInputChange("fromCountry", suggestion.address.country_code.toUpperCase());
                      } else if (typeof suggestion === "string") {
                        handleInputChange("returnStreet1", suggestion);
                      } else if (suggestion && suggestion.display_name) {
                        handleInputChange("returnStreet1", suggestion.display_name);
                      }
                    }}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <Label htmlFor="returnStreet2">Street (line 2)</Label>
                  <Input
                    id="returnStreet2"
                    value={formData.returnStreet2 || ""}
                    onChange={e => handleInputChange("returnStreet2", e.target.value)}
                    placeholder="Apt, suite, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="returnCity">City *</Label>
                  <Input
                    id="returnCity"
                    value={formData.returnCity || ""}
                    onChange={e => handleInputChange("returnCity", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="returnState">State *</Label>
                  <Input
                    id="returnState"
                    value={formData.returnState || ""}
                    onChange={e => handleInputChange("returnState", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="returnPostalCode">Postal Code / ZIP *</Label>
                  <Input
                    id="returnPostalCode"
                    value={formData.returnPostalCode || ""}
                    onChange={e => handleInputChange("returnPostalCode", e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>
              </div>
            </div>
          )}
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
          {/* Recipient Dropdown */}
          <div>
            <Label htmlFor="recipientDropdown">Select Saved Recipient</Label>
            <Select
              value={selectedRecipient?.id || ""}
              onValueChange={handleRecipientDropdown}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a saved recipient" />
              </SelectTrigger>
              <SelectContent>
                {savedRecipients.map((recipient) => (
                  <SelectItem key={recipient.id ?? ''} value={recipient.id ?? ''}>
                    {recipient.full_name} - {recipient.street1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <AddressAutocomplete
                    value={formData.toStreet1}
                    onChange={val => handleInputChange("toStreet1", val)}
                    onSelect={suggestion => {
                      if (suggestion && suggestion.address) {
                        const street = [suggestion.address.house_number, suggestion.address.road].filter(Boolean).join(" ");
                        handleInputChange("toStreet1", street);
                        if (suggestion.address.city) handleInputChange("toCity", suggestion.address.city);
                        if (suggestion.address.state) handleInputChange("toState", suggestion.address.state);
                        if (suggestion.address.postcode) handleInputChange("toPostalCode", suggestion.address.postcode);
                        if (suggestion.address.country_code) handleInputChange("toCountry", suggestion.address.country_code.toUpperCase());
                      } else if (typeof suggestion === "string") {
                        handleInputChange("toStreet1", suggestion);
                      } else if (suggestion && suggestion.display_name) {
                        handleInputChange("toStreet1", suggestion.display_name);
                      }
                    }}
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

              <div>
                <Label htmlFor="addressType">Address Type</Label>
                <Select
                  value={formData.addressType || (formData.isResidential ? "residential" : "commercial")}
                  onValueChange={val => handleInputChange("addressType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select address type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
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
