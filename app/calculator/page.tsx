"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calculator,
  Loader2,
  ArrowRight,
  Zap,
  Package,
  MapPin,
  Star,
  Clock,
  DollarSign,
  ChevronDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ParcelType {
  id: string
  name: string
  carrier: string
  description?: string
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

interface ShippingRate {
  carrier: string
  service: string
  amount: string
  currency: string
  estimated_days: number
  retail_rate?: string
}

const presetParcels: ParcelType[] = [
  // USPS Predefined Packaging
  { id: "USPS_FlatRateEnvelope", name: "Flat Rate Envelope", carrier: "USPS", description: "Up to 70 lbs" },
  { id: "USPS_FlatRateLegalEnvelope", name: "Flat Rate Legal Envelope", carrier: "USPS", description: "Up to 70 lbs" },
  {
    id: "USPS_FlatRatePaddedEnvelope",
    name: "Flat Rate Padded Envelope",
    carrier: "USPS",
    description: "Up to 70 lbs",
  },
  {
    id: "USPS_SmallFlatRateBox",
    name: "Small Flat Rate Box",
    carrier: "USPS",
    description: '8 5/8" x 5 3/8" x 1 5/8"',
  },
  { id: "USPS_MediumFlatRateBox", name: "Medium Flat Rate Box", carrier: "USPS", description: '11" x 8 1/2" x 5 1/2"' },
  { id: "USPS_LargeFlatRateBox", name: "Large Flat Rate Box", carrier: "USPS", description: '12" x 12" x 6"' },
  { id: "USPS_RegionalRateBoxA", name: "Regional Rate Box A", carrier: "USPS", description: '10" x 7" x 4 3/4"' },
  { id: "USPS_RegionalRateBoxB", name: "Regional Rate Box B", carrier: "USPS", description: '12" x 10 1/4" x 5"' },
  {
    id: "USPS_LargeFlatRateBoardGameBox",
    name: "Large Flat Rate Board Game Box",
    carrier: "USPS",
    description: '24" x 11 7/8" x 3 1/8"',
  },

  // UPS
  { id: "UPS_Box_10kg", name: "UPS Box 10kg", carrier: "UPS", description: "Any rigid box or thick parcel" },
  { id: "UPS_Box_25kg", name: "UPS Box 25kg", carrier: "UPS", description: "Any rigid box or thick parcel" },
  { id: "UPS_Express_Box", name: "UPS Express Box", carrier: "UPS", description: '13" x 11" x 2"' },
  { id: "UPS_Express_Box_Large", name: "UPS Express Box Large", carrier: "UPS", description: '18" x 13" x 3"' },
  { id: "UPS_Express_Envelope", name: "UPS Express Envelope", carrier: "UPS", description: '12 1/2" x 9 1/2"' },
  { id: "UPS_Express_Hard_Pak", name: "UPS Express Hard Pak", carrier: "UPS", description: '14" x 11" x 2"' },
  { id: "UPS_Express_Legal_Envelope", name: "UPS Express Legal Envelope", carrier: "UPS", description: '15" x 9 1/2"' },
  { id: "UPS_Express_Pak", name: "UPS Express Pak", carrier: "UPS", description: '16" x 12 3/4"' },
  { id: "UPS_Express_Tube", name: "UPS Express Tube", carrier: "UPS", description: '38" x 6" x 6"' },

  // FedEx
  { id: "FedEx_Box_10kg", name: "FedEx Box 10kg", carrier: "FedEx", description: '15.81" x 12.94" x 10.19"' },
  { id: "FedEx_Box_25kg", name: "FedEx Box 25kg", carrier: "FedEx", description: '54.80" x 42.10" x 33.50"' },
  {
    id: "FedEx_Box_Extra_Large_1",
    name: "FedEx Box Extra Large 1",
    carrier: "FedEx",
    description: '11.88" x 11.00" x 10.75"',
  },
  {
    id: "FedEx_Box_Extra_Large_2",
    name: "FedEx Box Extra Large 2",
    carrier: "FedEx",
    description: '15.75" x 14.13" x 6.00"',
  },
  { id: "FedEx_Box_Large_1", name: "FedEx Box Large 1", carrier: "FedEx", description: '8.75" x 7.75" x 4.75"' },
  { id: "FedEx_Box_Large_2", name: "FedEx Box Large 2", carrier: "FedEx", description: '11.25" x 8.75" x 7.75"' },
  { id: "FedEx_Box_Medium_1", name: "FedEx Box Medium 1", carrier: "FedEx", description: '8.75" x 2.63" x 11.25"' },
  { id: "FedEx_Box_Medium_2", name: "FedEx Box Medium 2", carrier: "FedEx", description: '11.25" x 8.75" x 4.38"' },
  { id: "FedEx_Box_Small_1", name: "FedEx Box Small 1", carrier: "FedEx", description: '12.38" x 10.88" x 1.50"' },
  { id: "FedEx_Box_Small_2", name: "FedEx Box Small 2", carrier: "FedEx", description: '8.75" x 11.25" x 4.38"' },
  { id: "FedEx_Envelope", name: "FedEx Envelope", carrier: "FedEx", description: '12.50" x 9.50"' },
  { id: "FedEx_Padded_Pak", name: "FedEx Padded Pak", carrier: "FedEx", description: '11.75" x 14.75"' },
  { id: "FedEx_Pak", name: "FedEx Pak", carrier: "FedEx", description: '15.50" x 12.00"' },
  { id: "FedEx_Tube", name: "FedEx Tube", carrier: "FedEx", description: '38" x 6" x 6"' },
]

const packageTypes = [
  { id: "custom", name: "Custom box", description: "Any rigid box or thick parcel", icon: "📦" },
  { id: "poly", name: "Poly mailer", description: "Any soft, padded, or flat bag", icon: "📮" },
]

export default function CalculatorPage() {
  const [fromZip, setFromZip] = useState("")
  const [toZip, setToZip] = useState("")
  const [weight, setWeight] = useState("")
  const [weightUnit, setWeightUnit] = useState("oz")
  const [packageType, setPackageType] = useState("custom")
  const [parcelTemplate, setParcelTemplate] = useState("custom")
  const [customDimensions, setCustomDimensions] = useState({
    length: "",
    width: "",
    height: "",
    unit: "in",
  })
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCalculateRates = async () => {
    if (!fromZip || !toZip || !weight) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")
    setRates([])

    try {
      const parcelData: any = {
        weight: Number(weight),
        mass_unit: weightUnit,
      }

      if (packageType === "custom" && parcelTemplate !== "custom") {
        parcelData.template = parcelTemplate
      } else if (packageType === "custom") {
        if (!customDimensions.length || !customDimensions.width || !customDimensions.height) {
          setError("Please provide custom dimensions or select a predefined package")
          setLoading(false)
          return
        }
        parcelData.length = customDimensions.length
        parcelData.width = customDimensions.width
        parcelData.height = customDimensions.height
        parcelData.distance_unit = customDimensions.unit
      } else if (packageType === "poly") {
        if (!customDimensions.length || !customDimensions.width || !customDimensions.height) {
          setError("Please provide dimensions for poly mailer")
          setLoading(false)
          return
        }
        parcelData.length = customDimensions.length
        parcelData.width = customDimensions.width
        parcelData.height = customDimensions.height
        parcelData.distance_unit = customDimensions.unit
      }

      const shipmentData = {
        address_from: {
          zip: fromZip,
          country: "US",
        },
        address_to: {
          zip: toZip,
          country: "US",
        },
        parcels: [parcelData],
      }

      const response = await fetch("/api/calculate-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate rates")
      }

      setRates(data.rates || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const groupedParcels = presetParcels.reduce(
    (acc, parcel) => {
      if (!acc[parcel.carrier]) {
        acc[parcel.carrier] = []
      }
      acc[parcel.carrier].push(parcel)
      return acc
    },
    {} as Record<string, ParcelType[]>,
  )

  const getCarrierLogo = (carrier: string) => {
    const logos: Record<string, string> = {
      USPS: "🇺🇸",
      UPS: "📦",
      FedEx: "✈️",
      DHL: "🚚",
    }
    return logos[carrier] || "📮"
  }

  const getCarrierColor = (carrier: string) => {
    const colors: Record<string, string> = {
      USPS: "bg-blue-100 text-blue-800",
      UPS: "bg-amber-100 text-amber-800",
      FedEx: "bg-purple-100 text-purple-800",
      DHL: "bg-red-100 text-red-800",
    }
    return colors[carrier] || "bg-gray-100 text-gray-800"
  }

  const getBestValue = () => {
    if (rates.length === 0) return null
    return rates.reduce((best, rate) => {
      const currentPrice = Number.parseFloat(rate.amount)
      const bestPrice = Number.parseFloat(best.amount)
      const currentDays = rate.estimated_days || 999
      const bestDays = best.estimated_days || 999

      if (currentDays < bestDays || (currentDays === bestDays && currentPrice < bestPrice)) {
        return rate
      }
      return best
    })
  }

  const getCheapest = () => {
    if (rates.length === 0) return null
    return rates.reduce((cheapest, rate) => {
      const currentPrice = Number.parseFloat(rate.amount)
      const cheapestPrice = Number.parseFloat(cheapest.amount)
      return currentPrice < cheapestPrice ? rate : cheapest
    })
  }

  const getMoreRates = () => {
    const bestValue = getBestValue()
    const cheapest = getCheapest()
    return rates.filter((rate) => rate !== bestValue && rate !== cheapest)
  }

  const selectedParcel = presetParcels.find((p) => p.id === parcelTemplate)

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Cosmic Shipping Calculator
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate shipping costs across the universe with our quantum-powered calculator. Get instant quotes from
            multiple carriers and save up to 89% on shipping rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Calculator Form */}
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <CardTitle className="text-2xl font-bold flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                Shipping Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="space-y-8">
                {/* From/To Addresses */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                        From ZIP Code
                      </Label>
                      <Input
                        placeholder="e.g. 10001"
                        value={fromZip}
                        onChange={(e) => setFromZip(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        To ZIP Code
                      </Label>
                      <Input
                        placeholder="e.g. 90210"
                        value={toZip}
                        onChange={(e) => setToZip(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Package Type Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-purple-600" />
                    Package Type
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packageTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          packageType === type.id
                            ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => setPackageType(type.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{type.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improved Predefined Package Selection */}
                {packageType === "custom" && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Predefined Package (Optional)</Label>
                    <Select value={parcelTemplate} onValueChange={setParcelTemplate}>
                      <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-purple-500 bg-white">
                        <div className="flex items-center justify-between w-full">
                          {parcelTemplate === "custom" ? (
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-gray-600">
                                Select a predefined package or use custom dimensions
                              </span>
                            </div>
                          ) : selectedParcel ? (
                            <div className="flex items-center space-x-3">
                              <Badge className={`${getCarrierColor(selectedParcel.carrier)} font-medium`}>
                                {getCarrierLogo(selectedParcel.carrier)} {selectedParcel.carrier}
                              </Badge>
                              <div>
                                <div className="font-medium text-left">{selectedParcel.name}</div>
                                {selectedParcel.description && (
                                  <div className="text-xs text-gray-500 text-left">{selectedParcel.description}</div>
                                )}
                              </div>
                            </div>
                          ) : null}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="max-h-80 w-full">
                        <SelectItem value="custom" className="py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">Custom dimensions</div>
                              <div className="text-xs text-gray-500">Enter your own package dimensions</div>
                            </div>
                          </div>
                        </SelectItem>
                        {Object.entries(groupedParcels).map(([carrier, parcels]) => (
                          <div key={carrier}>
                            <div className="px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 sticky top-0 border-b">
                              <div className="flex items-center space-x-2">
                                <span>{getCarrierLogo(carrier)}</span>
                                <span>{carrier} Packages</span>
                              </div>
                            </div>
                            {parcels.map((parcel) => (
                              <SelectItem key={parcel.id} value={parcel.id} className="pl-6 py-3">
                                <div className="flex items-center space-x-3 w-full">
                                  <Badge className={`${getCarrierColor(parcel.carrier)} text-xs`}>
                                    {parcel.carrier}
                                  </Badge>
                                  <div className="flex-1">
                                    <div className="font-medium">{parcel.name}</div>
                                    {parcel.description && (
                                      <div className="text-xs text-gray-500 mt-1">{parcel.description}</div>
                                    )}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            <Separator className="my-1" />
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Dimensions */}
                {((packageType === "custom" && parcelTemplate === "custom") || packageType === "poly") && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-gray-700">Package Dimensions</Label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Length</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={customDimensions.length}
                          onChange={(e) => setCustomDimensions((prev) => ({ ...prev, length: e.target.value }))}
                          className="text-center border-2 border-gray-200 focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Width</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={customDimensions.width}
                          onChange={(e) => setCustomDimensions((prev) => ({ ...prev, width: e.target.value }))}
                          className="text-center border-2 border-gray-200 focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Height</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="0.0"
                          value={customDimensions.height}
                          onChange={(e) => setCustomDimensions((prev) => ({ ...prev, height: e.target.value }))}
                          className="text-center border-2 border-gray-200 focus:border-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Unit</Label>
                        <Select
                          value={customDimensions.unit}
                          onValueChange={(value) => setCustomDimensions((prev) => ({ ...prev, unit: value }))}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-purple-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in">inches</SelectItem>
                            <SelectItem value="cm">cm</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weight */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Package Weight</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter weight"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-12 text-lg text-center border-2 border-gray-200 focus:border-purple-500"
                    />
                    <Select value={weightUnit} onValueChange={setWeightUnit}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oz">Ounces (oz)</SelectItem>
                        <SelectItem value="lb">Pounds (lb)</SelectItem>
                        <SelectItem value="g">Grams (g)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleCalculateRates}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Calculating Cosmic Rates...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6 mr-3" />
                      Calculate Rates
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Shipping Rates
                </span>
              </h2>
              <p className="text-gray-600">Powered by alien technology for maximum savings</p>
            </div>

            {loading ? (
              <Card className="p-12 shadow-xl border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardContent className="text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto">
                      <img
                        src="/images/alien-delivery-ship.png"
                        alt="Alien ship calculating"
                        className="w-full h-full object-contain animate-pulse"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Quantum Processing...</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Our alien engineers are scanning the galaxy for the best shipping rates. This may take a few
                    moments...
                  </p>
                </CardContent>
              </Card>
            ) : rates.length > 0 ? (
              <div className="space-y-6">
                {/* Best Value */}
                {getBestValue() && (
                  <div>
                    <div className="flex items-center mb-4">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <h3 className="text-lg font-bold text-gray-900">Best Value</h3>
                    </div>
                    <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{getCarrierLogo(getBestValue()!.carrier)}</div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">
                                {getBestValue()!.carrier} {getBestValue()!.service}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {getBestValue()!.estimated_days} business days
                              </div>
                              <div className="text-xs text-green-600 font-medium mt-1">
                                ✓ Free tracking and insurance included
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              ${Number.parseFloat(getBestValue()!.amount).toFixed(2)}
                            </div>
                            {getBestValue()!.retail_rate && (
                              <div className="text-sm text-gray-500 line-through">
                                ${Number.parseFloat(getBestValue()!.retail_rate).toFixed(2)}
                              </div>
                            )}
                            <div className="text-xs text-purple-600 font-medium">🛸 Alien discount applied</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Cheapest */}
                {getCheapest() && getCheapest() !== getBestValue() && (
                  <div>
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                      <h3 className="text-lg font-bold text-gray-900">Cheapest Option</h3>
                    </div>
                    <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{getCarrierLogo(getCheapest()!.carrier)}</div>
                            <div>
                              <div className="font-bold text-lg text-gray-900">
                                {getCheapest()!.carrier} {getCheapest()!.service}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {getCheapest()!.estimated_days} business days
                              </div>
                              <div className="text-xs text-green-600 font-medium mt-1">
                                ✓ Free tracking and insurance included
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              ${Number.parseFloat(getCheapest()!.amount).toFixed(2)}
                            </div>
                            {getCheapest()!.retail_rate && (
                              <div className="text-sm text-gray-500 line-through">
                                ${Number.parseFloat(getCheapest()!.retail_rate).toFixed(2)}
                              </div>
                            )}
                            <div className="text-xs text-purple-600 font-medium">🛸 Alien discount applied</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* More Rates */}
                {getMoreRates().length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">More Options</h3>
                    <div className="space-y-4">
                      {getMoreRates().map((rate, index) => (
                        <Card
                          key={index}
                          className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-3xl">{getCarrierLogo(rate.carrier)}</div>
                                <div>
                                  <div className="font-bold text-lg text-gray-900">
                                    {rate.carrier} {rate.service}
                                  </div>
                                  <div className="text-sm text-gray-600 flex items-center mt-1">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {rate.estimated_days} business days
                                  </div>
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    ✓ Free tracking + $100 insurance
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-gray-900">
                                  ${Number.parseFloat(rate.amount).toFixed(2)}
                                </div>
                                {rate.retail_rate &&
                                  Number.parseFloat(rate.retail_rate) > Number.parseFloat(rate.amount) && (
                                    <div className="text-sm text-gray-500 line-through">
                                      ${Number.parseFloat(rate.retail_rate).toFixed(2)}
                                    </div>
                                  )}
                                <div className="text-xs text-purple-600 font-medium">🛸 Alien discount applied</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Ready to Ship?</h3>
                    <p className="text-purple-100 mb-4">
                      Sign up for free to access these rates and start shipping with alien technology!
                    </p>
                    <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-2">
                      Get Started for Free
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-12 shadow-xl border-0 bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `url('/images/abstract-ecommerce-flow.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
                <CardContent className="text-center space-y-6 relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6">
                    <img
                      src="/images/alien-delivery-ship.png"
                      alt="Alien ship ready"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Ready for Quantum Calculations</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Fill out the form to get instant shipping quotes from multiple carriers with our alien-negotiated
                    rates. Save up to 89% on every shipment!
                  </p>
                  <div className="flex justify-center space-x-8 text-sm text-gray-500 mt-8">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                      Real-time rates
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      Instant quotes
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      89% savings
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
