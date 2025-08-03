"use client"

import { useState } from "react"
import { Edit, Trash2, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { RecipientAddress, ShippingAddress } from "@/lib/types/address"

interface AddressListProps {
  type: "recipient" | "shipping"
  addresses: (RecipientAddress | ShippingAddress)[]
  onEdit: (address: RecipientAddress | ShippingAddress) => void
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function AddressList({ type, addresses, onEdit, onDelete, isLoading = false }: AddressListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const getAddressTypeColor = (addressType: string) => {
    const colors = {
      residential: "bg-blue-100 text-blue-800",
      commercial: "bg-green-100 text-green-800",
      warehouse: "bg-orange-100 text-orange-800",
      government: "bg-purple-100 text-purple-800",
      pickup_point: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[addressType as keyof typeof colors] || colors.other
  }

  const getUsageTypeColor = (usageType: string) => {
    const colors = {
      shipping: "bg-emerald-100 text-emerald-800",
      return: "bg-red-100 text-red-800",
      both: "bg-indigo-100 text-indigo-800",
    }
    return colors[usageType as keyof typeof colors] || colors.shipping
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by adding your first {type === "recipient" ? "recipient" : "shipping"} address.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {addresses.map((address) => (
        <Card key={address.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {address.full_name}
                {type === "recipient" && (address as RecipientAddress).is_default && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(address)} disabled={isLoading}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading || deletingId === address.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this address? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(address.id!)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={getAddressTypeColor(address.address_type)}>{address.address_type}</Badge>
              {type === "shipping" && (
                <Badge className={getUsageTypeColor((address as ShippingAddress).usage_type)}>
                  {(address as ShippingAddress).usage_type}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-600">
              <div>
                {type === "recipient"
                  ? (address as RecipientAddress).street1
                  : (address as ShippingAddress).address_line1}
              </div>
              {((type === "recipient" && (address as RecipientAddress).street2) ||
                (type === "shipping" && (address as ShippingAddress).address_line2)) && (
                <div>
                  {type === "recipient"
                    ? (address as RecipientAddress).street2
                    : (address as ShippingAddress).address_line2}
                </div>
              )}
              <div>
                {address.city}, {address.state} {address.postal_code}
              </div>
              <div>{address.country}</div>
            </div>

            {address.company && (
              <div className="text-sm text-gray-600">
                <strong>Company:</strong> {address.company}
              </div>
            )}

            {address.email && (
              <div className="text-sm text-gray-600">
                <strong>Email:</strong> {address.email}
              </div>
            )}

            {((type === "recipient" && (address as RecipientAddress).phone_number) ||
              (type === "shipping" && (address as ShippingAddress).phone)) && (
              <div className="text-sm text-gray-600">
                <strong>Phone:</strong>{" "}
                {type === "recipient" ? (address as RecipientAddress).phone_number : (address as ShippingAddress).phone}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
