"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Truck, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  amount: number
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
  const [selectedRateId, setSelectedRateId] = useState<string>("")
  const [fetchingRates, setFetchingRates] = useState(false)

  useEffect(() => {
    if (shipmentData.fromAddress && shipmentData.toAddress && shipmentData.parcel) {
      fetchShippingRates()
    }
  }, [shipmentData.fromAddress, shipmentData.toAddress, shipmentData.parcel])

  const fetchShippingRates = async () => {
    setFetchingRates(true)
    try {
      const response = await fetch("/api/calculate-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_address: {
            name: shipmentData.fromAddress.full_name,
            street1: shipmentData.fromAddress.address_line1,
            street2: shipmentData.fromAddress.address_line2,
            city: shipmentData.fromAddress.city,
            state: shipmentData.fromAddress.state,
            zip: shipmentData.fromAddress.postal_code,
            country: shipmentData.fromAddress.country_code,
          },
          to_address: {
            name: shipmentData.toAddress.full_name,
            street1: shipmentData.toAddress.street1,
            street2: shipmentData.toAddress.street2,
            city: shipmentData.toAddress.city,
            state: shipmentData.toAddress.state,
            zip: shipmentData.toAddress.postal_code,
            country: shipmentData.toAddress.country_code,
          },
          parcel: {
            length: shipmentData.parcel.length,
            width: shipmentData.parcel.width,
            height: shipmentData.parcel.height,
            distance_unit: shipmentData.parcel.distance_unit,
            weight: shipmentData.parcel.weight,
            mass_unit: "oz", // Ensure mass_unit is always 'oz'
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch shipping rates")
      }

      const data = await response.json()
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

  const getProviderLogo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "usps":
        return "🇺🇸"
      case "ups":
        return "📦"
      case "fedex":
        return "✈️"
      case "dhl":
        return "🚚"
      default:
        return "📮"
    }
  }

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
                selectedRateId === rate.id ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => handleRateSelect(rate)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getProviderLogo(rate.provider)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rate.provider.toUpperCase()}</span>
                        <Badge variant="outline" className="text-xs">
                          {rate.service_level_name}
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
                  <div className="text-right">
                    <div className="text-lg font-semibold">{formatPrice(rate.amount, rate.currency)}</div>
                    <div className="text-xs text-muted-foreground">{rate.currency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Rate Summary */}
      {selectedRateId && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Selected Service:</h4>
            {(() => {
              const selectedRate = rates.find((rate) => rate.id === selectedRateId)
              if (!selectedRate) return null

              return (
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Carrier:</strong> {selectedRate.provider.toUpperCase()}
                  </div>
                  <div>
                    <strong>Service:</strong> {selectedRate.service_level_name}
                  </div>
                  <div>
                    <strong>Cost:</strong> {formatPrice(selectedRate.amount, selectedRate.currency)}
                  </div>
                  <div>
                    <strong>Delivery:</strong> {selectedRate.estimated_days}{" "}
                    {selectedRate.estimated_days === 1 ? "day" : "days"}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
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
