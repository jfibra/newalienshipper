"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Truck, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ShippingRatesStepProps {
  shipmentData: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

interface ShippingRate {
  id: string
  provider: string
  service_level_name: string
  amount: string
  currency: string
  estimated_days: number
  duration_terms: string
  carrier_account: string
  attributes: any
}

export function ShippingRatesStep({
  shipmentData,
  onUpdate,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
}: ShippingRatesStepProps) {
  const { toast } = useToast()
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string | null>(shipmentData.selectedRate?.id || null)
  const [fetchingRates, setFetchingRates] = useState(false)

  useEffect(() => {
    if (shipmentData.fromAddress && shipmentData.toAddress && shipmentData.parcel) {
      fetchShippingRates()
    }
  }, [shipmentData.fromAddress, shipmentData.toAddress, shipmentData.parcel])

  const fetchShippingRates = async () => {
    setFetchingRates(true)
    try {
      // Prepare shipment data for Shippo API
      const shipmentPayload = {
        address_from: {
          name: shipmentData.fromAddress.full_name,
          company: shipmentData.fromAddress.company || "",
          street1: shipmentData.fromAddress.address_line1,
          street2: shipmentData.fromAddress.address_line2 || "",
          city: shipmentData.fromAddress.city,
          state: shipmentData.fromAddress.state,
          zip: shipmentData.fromAddress.postal_code,
          country: shipmentData.fromAddress.country_code,
          phone: shipmentData.fromAddress.phone || "",
          email: shipmentData.fromAddress.email || "",
        },
        address_to: {
          name: shipmentData.toAddress.full_name,
          company: shipmentData.toAddress.company || "",
          street1: shipmentData.toAddress.street1,
          street2: shipmentData.toAddress.street2 || "",
          city: shipmentData.toAddress.city,
          state: shipmentData.toAddress.state,
          zip: shipmentData.toAddress.postal_code,
          country: shipmentData.toAddress.country_code,
          phone: shipmentData.toAddress.phone_number || "",
          email: shipmentData.toAddress.email || "",
        },
        parcels: [
          {
            length: shipmentData.parcel.length,
            width: shipmentData.parcel.width,
            height: shipmentData.parcel.height,
            distance_unit: shipmentData.parcel.distance_unit,
            weight: shipmentData.parcel.weight,
            mass_unit: shipmentData.parcel.mass_unit,
          },
        ],
        async: false,
      }

      const response = await fetch("/api/calculate-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentPayload),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch shipping rates")
      }

      const data = await response.json()

      if (data.rates && data.rates.length > 0) {
        // Save rates to database
        const ratesData = data.rates.map((rate: any) => ({
          provider: rate.carrier,
          service_level_name: rate.service,
          amount: Number.parseFloat(rate.amount),
          currency: rate.currency,
          estimated_days: rate.estimated_days || null,
          duration_terms: rate.duration_terms || "",
          carrier_account: rate.carrier_account || "",
          attributes: rate,
        }))

        const { data: savedRates, error } = await supabase.from("shippo_rates").insert(ratesData).select()

        if (error) throw error

        setRates(savedRates)
        onUpdate({ availableRates: savedRates })
      } else {
        toast({
          title: "No Rates Available",
          description: "No shipping rates were found for this shipment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching rates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates",
        variant: "destructive",
      })
    } finally {
      setFetchingRates(false)
    }
  }

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRateId(rate.id)
    onUpdate({ selectedRate: rate })
  }

  const handleContinue = () => {
    if (selectedRateId) {
      onNext()
    }
  }

  const getProviderLogo = (provider: string) => {
    // You can add actual logos here
    return provider.toUpperCase()
  }

  const formatEstimatedDays = (days: number | null) => {
    if (!days) return "Unknown"
    if (days === 1) return "1 business day"
    return `${days} business days`
  }

  if (fetchingRates) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="h-5 w-5" />
          <span className="text-lg font-semibold">Fetching Shipping Rates...</span>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Available Shipping Rates
        </h3>
        <Button variant="outline" size="sm" onClick={fetchShippingRates} disabled={fetchingRates}>
          Refresh Rates
        </Button>
      </div>

      {rates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rates Available</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find any shipping rates for this shipment. Please check your addresses and parcel details.
            </p>
            <Button onClick={fetchShippingRates} disabled={fetchingRates}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rates.map((rate) => (
            <Card
              key={rate.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRateId === rate.id ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => handleRateSelect(rate)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                          {getProviderLogo(rate.provider)}
                        </div>
                        <div>
                          <div className="font-medium">{rate.provider}</div>
                          <div className="text-sm text-muted-foreground">{rate.service_level_name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatEstimatedDays(rate.estimated_days)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold">${Number.parseFloat(rate.amount).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{rate.currency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Rate Summary */}
      {selectedRateId && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Selected Rate:</h4>
            {(() => {
              const selectedRate = rates.find((r) => r.id === selectedRateId)
              return selectedRate ? (
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Carrier:</strong> {selectedRate.provider}
                  </div>
                  <div>
                    <strong>Service:</strong> {selectedRate.service_level_name}
                  </div>
                  <div>
                    <strong>Cost:</strong> ${Number.parseFloat(selectedRate.amount).toFixed(2)} {selectedRate.currency}
                  </div>
                  <div>
                    <strong>Estimated Delivery:</strong> {formatEstimatedDays(selectedRate.estimated_days)}
                  </div>
                </div>
              ) : null
            })()}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          Previous
        </Button>
        <Button onClick={handleContinue} disabled={!selectedRateId || isLoading}>
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
