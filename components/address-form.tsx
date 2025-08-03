"use client"

import { useEffect } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AddressAutocomplete } from "./address-autocomplete"

import { recipientAddressSchema, shippingAddressSchema } from "@/lib/validations/address"
import type { RecipientAddress, ShippingAddress, UserProfile, Country, LocationIQSuggestion } from "@/lib/types/address"

type AddressFormFields = {
  // Common fields
  full_name: string;
  email: string;
  company: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  country_code: string;
  address_type: string;
  // Recipient only
  phone_number?: string;
  street1?: string;
  street2?: string;
  // Shipping only
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  usage_type?: string;
  is_default?: boolean; // Now only used for shipping
};

interface AddressFormProps {
  type: "recipient" | "shipping"
  address?: RecipientAddress | ShippingAddress
  countries: Country[]
  userProfile?: UserProfile
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function AddressForm({
  type,
  address,
  countries,
  userProfile,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddressFormProps) {
  const schema = type === "recipient" ? recipientAddressSchema : shippingAddressSchema

  const form = useForm<AddressFormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      email: "",
      company: "",
      city: "",
      state: "",
      postal_code: "",
      country: "United States",
      country_code: "US",
      address_type: "residential",
      phone_number: type === "recipient" ? "" : undefined,
      street1: type === "recipient" ? "" : undefined,
      street2: type === "recipient" ? "" : undefined,
      is_default: false,
      phone: type === "shipping" ? "" : undefined,
      address_line1: type === "shipping" ? "" : undefined,
      address_line2: type === "shipping" ? "" : undefined,
      usage_type: type === "shipping" ? "shipping" : undefined,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form
  const watchedCountry = watch("country")
  const watchedCountryCode = watch("country_code")

  // Auto-fill user data for shipping addresses
  useEffect(() => {
    if (type === "shipping" && userProfile && !address) {
      if (userProfile.full_name) setValue("full_name", userProfile.full_name)
      if (userProfile.email) setValue("email", userProfile.email)
      if (userProfile.phone) setValue("phone", userProfile.phone as string)
      if (userProfile.company) setValue("company", userProfile.company)
    }
  }, [type, userProfile, address, setValue])

  // Load existing address data
  useEffect(() => {
    if (address) {
      setValue("full_name", address.full_name)
      setValue("email", address.email || "")
      setValue(
        type === "recipient" ? "phone_number" : "phone",
        type === "recipient"
          ? (address as RecipientAddress).phone_number || ""
          : (address as ShippingAddress).phone || ""
      )
      setValue("company", address.company || "")
      setValue(
        type === "recipient" ? "street1" : "address_line1",
        type === "recipient"
          ? (address as RecipientAddress).street1 || ""
          : (address as ShippingAddress).address_line1 || ""
      )
      setValue(
        type === "recipient" ? "street2" : "address_line2",
        type === "recipient"
          ? (address as RecipientAddress).street2 || ""
          : (address as ShippingAddress).address_line2 || ""
      )
      setValue("city", address.city)
      setValue("state", address.state)
      setValue("postal_code", address.postal_code)
      setValue("country", address.country)
      setValue("country_code", address.country_code)
      setValue("address_type", address.address_type || "residential")

      if (type === "shipping") {
        setValue("usage_type", (address as ShippingAddress).usage_type)
        setValue("is_default", (address as ShippingAddress).is_default ?? false)
      }
    }
  }, [address, setValue, type])

  const handleCountryChange = (countryName: string) => {
    const country = countries.find((c) => c.name === countryName)
    if (country) {
      setValue("country", country.name)
      setValue("country_code", country.code)
    }
  }

  const handleAddressSelect = (suggestion: LocationIQSuggestion) => {
    if (suggestion.address) {
      // Compose street address from house_number and road only
      const street = [suggestion.address.house_number, suggestion.address.road]
        .filter(Boolean)
        .join(' ');
      if (type === "recipient") {
        setValue("street1", street);
      } else {
        setValue("address_line1", street);
      }
      if (suggestion.address.city) setValue("city", suggestion.address.city);
      if (suggestion.address.state) setValue("state", suggestion.address.state);
      if (suggestion.address.postcode) setValue("postal_code", suggestion.address.postcode);
      if (suggestion.address.country) {
        const country = countries.find((c) => c.code === suggestion.address.country_code?.toUpperCase());
        if (country) {
          setValue("country", country.name);
          setValue("country_code", country.code);
        }
      }
    }
  }

  const addressTypes = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "warehouse", label: "Warehouse" },
    { value: "government", label: "Government" },
    { value: "pickup_point", label: "Pickup Point" },
    { value: "other", label: "Other" },
  ];

  const usageTypes = [
    { value: "shipping", label: "Shipping Only" },
    { value: "return", label: "Return Only" },
    { value: "both", label: "Both Shipping & Return" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" {...register("full_name")} className={errors.full_name ? "border-red-500" : ""} />
          {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor={type === "recipient" ? "phone_number" : "phone"}>Phone Number</Label>
          <Input
            id={type === "recipient" ? "phone_number" : "phone"}
            {...register(type === "recipient" ? "phone_number" : "phone")}
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register("company")} />
        </div>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor={type === "recipient" ? "street1" : "address_line1"}>Street Address *</Label>
          <AddressAutocomplete
            value={(type === "recipient" ? watch("street1") : watch("address_line1")) || ""}
            onChange={(value) => setValue(type === "recipient" ? "street1" : "address_line1", value)}
            onSelect={handleAddressSelect}
            placeholder="Enter street address"
            className={
              (errors as FieldErrors<AddressFormFields>)[type === "recipient" ? "street1" : "address_line1"]
                ? "border-red-500"
                : ""
            }
          />
          {(errors as FieldErrors<AddressFormFields>)[type === "recipient" ? "street1" : "address_line1"] && (
            <p className="text-sm text-red-500 mt-1">
              {(errors as FieldErrors<AddressFormFields>)[type === "recipient" ? "street1" : "address_line1"]?.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor={type === "recipient" ? "street2" : "address_line2"}>Street Address 2</Label>
          <Input
            id={type === "recipient" ? "street2" : "address_line2"}
            {...register(type === "recipient" ? "street2" : "address_line2")}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register("city")} className={errors.city ? "border-red-500" : ""} />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input id="state" {...register("state")} className={errors.state ? "border-red-500" : ""} />
          {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <Label htmlFor="postal_code">Postal Code *</Label>
          <Input id="postal_code" {...register("postal_code")} className={errors.postal_code ? "border-red-500" : ""} />
          {errors.postal_code && <p className="text-sm text-red-500 mt-1">{errors.postal_code.message}</p>}
        </div>
        <div>
          <Label htmlFor="country">Country *</Label>
          <Select value={watchedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.name}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>}
        </div>
      </div>

      {/* Address Type, Usage Type, and Default Checkbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <Label htmlFor="address_type">Address Type *</Label>
          <Select value={watch("address_type")} onValueChange={(value) => setValue("address_type", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              {addressTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {type === "shipping" && (
          <div>
            <Label htmlFor="usage_type">Usage Type *</Label>
            <Select value={watch("usage_type")} onValueChange={(value) => setValue("usage_type", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select usage type" />
              </SelectTrigger>
              <SelectContent>
                {usageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {type === "shipping" && (
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="is_default"
            checked={watch("is_default")}
            onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
          />
          <Label htmlFor="is_default">Set as default address</Label>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : address ? "Update Address" : "Add Address"}
        </Button>
      </div>
    </form>
  )
}
