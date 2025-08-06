"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Truck, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { debugRates } from "@/lib/debug-rates"

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
  provider?: string
  carrier?: string
  service_level_name?: string
  service?: string
  amount: number | string
  currency: string
  estimated_days: number
  duration_terms?: string
  carrier_account?: string
  attributes?: any
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
  const [selectedRateId, setSelectedRateId] = useState<string>("")
  const [fetchingRates, setFetchingRates] = useState(false)

  useEffect(() => {
    if (shipmentData.fromAddress && shipmentData.toAddress && shipmentData.parcel) {
      fetchShippingRates()
    }
  }, [shipmentData.fromAddress, shipmentData.toAddress, shipmentData.parcel])

  // Conversion helpers
  const toInches = (value: number, unit: string) => {
    if (unit === "in") return value
    if (unit === "cm") return value / 2.54
    return value
  }
  const toOunces = (value: number, unit: string) => {
    if (unit === "oz") return value
    if (unit === "lb") return value * 16
    if (unit === "g") return value / 28.3495
    if (unit === "kg") return value * 35.274
    return value
  }

  const fetchShippingRates = async () => {
    setFetchingRates(true)
    try {
      // Convert all dimensions to inches and weight to ounces
      const parcel = shipmentData.parcel || {}
      const length = toInches(Number(parcel.length), parcel.distance_unit)
      const width = toInches(Number(parcel.width), parcel.distance_unit)
      const height = toInches(Number(parcel.height), parcel.distance_unit)
      const weight = toOunces(Number(parcel.weight), parcel.mass_unit)

      // Match calculator payload: address_from, address_to, parcels (array)
      // But include all available address fields for Shippo compatibility
      const payload = {
        address_from: {
          zip: shipmentData.fromAddress?.postal_code,
          country: shipmentData.fromAddress?.country_code || "US",
          city: shipmentData.fromAddress?.city,
          state: shipmentData.fromAddress?.state,
          street1: shipmentData.fromAddress?.address_line1,
          street2: shipmentData.fromAddress?.address_line2,
          name: shipmentData.fromAddress?.full_name,
        },
        address_to: {
          zip: shipmentData.toAddress?.postal_code,
          country: shipmentData.toAddress?.country_code || "US",
          city: shipmentData.toAddress?.city,
          state: shipmentData.toAddress?.state,
          street1: shipmentData.toAddress?.street1,
          street2: shipmentData.toAddress?.street2,
          name: shipmentData.toAddress?.full_name,
        },
        parcels: [
          {
            length: String(length),
            width: String(width),
            height: String(height),
            distance_unit: "in",
            weight,
            mass_unit: "oz",
            ...(parcel.parcel_template ? { template: parcel.parcel_template } : {}),
          },
        ],
      };

      const response = await fetch("/api/calculate-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch shipping rates")
      }

      const data = await response.json()
      debugRates(data.rates)
      setRates(data.rates || [])

      if (data.rates && data.rates.length > 0) {
        // Auto-select the first rate
        setSelectedRateId(data.rates[0].id)
      }
    } catch (error) {
      console.error("Error fetching rates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFetchingRates(false)
    }
  }

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRateId(rate.id)
    onUpdate({ selectedRate: rate, availableRates: rates })
  }

  const handleContinue = () => {
    const selectedRate = rates.find((rate) => rate.id === selectedRateId)
    if (selectedRate) {
      onUpdate({ selectedRate, availableRates: rates })
      onNext()
    }
  }

  const formatPrice = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Update rate rendering to use rate.carrier (not provider) for logo and display, since carrier is present in the Shippo response.
  const getCarrierLogo = (carrier: string | undefined) => {
    if (!carrier) return "📦";
    switch (carrier.toLowerCase()) {
      case "usps":
        return "🇺🇸";
      case "ups":
        return "📦";
      case "fedex":
        return "✈️";
      case "dhl":
        return "🚚";
      default:
        return "📮";
    }
  }
  const safeCarrier = (carrier: string | undefined) => carrier ? carrier.toUpperCase() : "UNKNOWN";

  // Defensive utility for carrier display
  // const safeCarrier = (carrier: string | undefined) => carrier ? carrier.toUpperCase() : "UNKNOWN";

  if (fetchingRates) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Fetching shipping rates...</p>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rates.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No shipping rates available</h3>
        <p className="text-muted-foreground mb-4">
          We couldn't find any shipping rates for this route. Please check your addresses and try again.
        </p>
        <Button onClick={fetchShippingRates} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Choose a shipping service</h3>
        <div className="space-y-3">
          {rates.map((rate) => (
            <Card
              key={rate.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRateId === rate.id ? "ring-2 ring-primary bg-primary/5 border-primary" : ""
              }`}
              onClick={() => handleRateSelect(rate)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getCarrierLogo(rate.carrier)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{safeCarrier(rate.carrier)}</span>
                      <Badge variant="outline" className="text-xs">
                        {rate.service_level_name || rate.service}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {rate.estimated_days} {rate.estimated_days === 1 ? "day" : "days"}
                        </span>
                      </div>
                      {rate.duration_terms && <span className="text-xs">({rate.duration_terms})</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div className="text-lg font-semibold">{formatPrice(typeof rate.amount === "string" ? parseFloat(rate.amount) : rate.amount, rate.currency)}</div>
                  <div className="text-xs text-muted-foreground">{rate.currency}</div>
                  {selectedRateId === rate.id && (
                    <span className="inline-block text-green-600 font-bold">✓ Selected</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleContinue} disabled={!selectedRateId || isLoading}>
          Continue
        </Button>
      </div>
    </div>
  )
}
