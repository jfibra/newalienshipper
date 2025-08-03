"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AddressForm } from "@/components/address-form"
import { AddressList } from "@/components/address-list"
import { supabase } from "@/lib/supabase"
import type { RecipientAddress, ShippingAddress, UserProfile, Country } from "@/lib/types/address"

export default function AddressBookPage() {
  const [recipientAddresses, setRecipientAddresses] = useState<RecipientAddress[]>([])
  const [shippingAddresses, setShippingAddresses] = useState<ShippingAddress[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<"recipient" | "shipping">("recipient")
  const [editingAddress, setEditingAddress] = useState<RecipientAddress | ShippingAddress | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load countries
      const countriesResponse = await fetch("/countries.json")
      const countriesData = await countriesResponse.json()
      setCountries(countriesData)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please log in to view your addresses")
        return
      }

      // Load user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, company")
        .eq("id", user.id)
        .single()

      if (profile) {
        setUserProfile({
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email || user.email,
          phone: profile.phone,
          company: profile.company,
        })
      } else {
        // Fallback to user data
        setUserProfile({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          phone: user.user_metadata?.phone,
          company: user.user_metadata?.company,
        })
      }

      // Load recipient addresses
      const { data: recipientData, error: recipientError } = await supabase
        .from("recipient_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (recipientError) {
        console.error("Error loading recipient addresses:", recipientError)
        toast.error("Failed to load recipient addresses")
      } else {
        setRecipientAddresses(recipientData || [])
      }

      // Load shipping addresses
      const { data: shippingData, error: shippingError } = await supabase
        .from("shipping_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (shippingError) {
        console.error("Error loading shipping addresses:", shippingError)
        toast.error("Failed to load shipping addresses")
      } else {
        setShippingAddresses(shippingData || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load address book data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAddress = (type: "recipient" | "shipping") => {
    setDialogType(type)
    setEditingAddress(null)
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: RecipientAddress | ShippingAddress) => {
    setDialogType("street1" in address ? "recipient" : "shipping")
    setEditingAddress(address)
    setIsDialogOpen(true)
  }

  const handleSubmitAddress = async (data: any) => {
    try {
      setIsSubmitting(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please log in to save addresses")
        return
      }

      const addressData = {
        ...data,
        user_id: user.id,
        ...(editingAddress ? { id: editingAddress.id } : {}),
      }

      if (dialogType === "recipient") {
        if (editingAddress) {
          // Update existing recipient address
          const { error } = await supabase.from("recipient_addresses").update(addressData).eq("id", editingAddress.id)

          if (error) throw error

          setRecipientAddresses((prev) =>
            prev.map((addr) => (addr.id === editingAddress.id ? { ...addr, ...addressData } : addr)),
          )
          toast.success("Recipient address updated successfully")
        } else {
          // Create new recipient address
          const { data: newAddress, error } = await supabase
            .from("recipient_addresses")
            .insert(addressData)
            .select()
            .single()

          if (error) throw error

          setRecipientAddresses((prev) => [newAddress, ...prev])
          toast.success("Recipient address added successfully")
        }
      } else {
        // SHIP: Enforce only one default shipping address per user
        if (addressData.is_default) {
          // Unset is_default for all other addresses for this user
          await supabase
            .from("shipping_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id)
        }
        if (editingAddress) {
          // Update existing shipping address
          const { error } = await supabase.from("shipping_addresses").update(addressData).eq("id", editingAddress.id)

          if (error) throw error

          setShippingAddresses((prev) =>
            prev.map((addr) => (addr.id === editingAddress.id ? { ...addr, ...addressData } : addr)),
          )
          toast.success("Shipping address updated successfully")
        } else {
          // Create new shipping address
          const { data: newAddress, error } = await supabase
            .from("shipping_addresses")
            .insert(addressData)
            .select()
            .single()

          if (error) throw error

          setShippingAddresses((prev) => [newAddress, ...prev])
          toast.success("Shipping address added successfully")
        }
      }

      setIsDialogOpen(false)
      setEditingAddress(null)
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      const tableName = dialogType === "recipient" ? "recipient_addresses" : "shipping_addresses"
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) throw error

      if (dialogType === "recipient") {
        setRecipientAddresses((prev) => prev.filter((addr) => addr.id !== id))
      } else {
        setShippingAddresses((prev) => prev.filter((addr) => addr.id !== id))
      }

      toast.success(`Address deleted successfully`)
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Failed to delete address")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Address Book</h1>
          <p className="text-muted-foreground">Manage your shipping and recipient addresses for faster checkout.</p>
        </div>

        <Tabs defaultValue="recipient" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recipient">My Recipient Addresses</TabsTrigger>
            <TabsTrigger value="shipping">My From Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="recipient" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recipient Addresses</CardTitle>
                    <CardDescription>Addresses where you send packages to</CardDescription>
                  </div>
                  <Button onClick={() => handleAddAddress("recipient")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Recipient Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AddressList
                  type="recipient"
                  addresses={recipientAddresses}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="bg-white space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Shipping Addresses</CardTitle>
                    <CardDescription>Addresses where you send packages from</CardDescription>
                  </div>
                  <Button onClick={() => handleAddAddress("shipping")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shipping Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AddressList
                  type="shipping"
                  addresses={shippingAddresses}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit" : "Add"} {dialogType === "recipient" ? "Recipient" : "Shipping"} Address
              </DialogTitle>
              <DialogDescription>
                {editingAddress
                  ? `Update your ${dialogType} address information.`
                  : `Add a new ${dialogType} address to your address book.`}
              </DialogDescription>
            </DialogHeader>
            <AddressForm
              type={dialogType}
                address={editingAddress ?? undefined}
                countries={countries}
                userProfile={userProfile ?? undefined}
                onSubmit={handleSubmitAddress}
                onCancel={() => setIsDialogOpen(false)}
                isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
