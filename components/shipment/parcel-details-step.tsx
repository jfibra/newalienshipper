"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Package, Ruler, Weight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ParcelDetailsStepProps {
  shipmentData: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isLoading: boolean
}

interface ParcelData {
  length: string
  width: string
  height: string
  weight: string
  distanceUnit: "in" | "cm"
  massUnit: "oz" | "lb" | "g" | "kg"
  template: string
}

const PARCEL_TEMPLATES = [
  { id: "custom", name: "Custom", description: "Enter custom dimensions" },
  { id: "usps_small_flat_rate_box", name: "USPS Small Flat Rate Box", dimensions: "8.5 × 5.5 × 1.625 in" },
  { id: "usps_medium_flat_rate_box", name: "USPS Medium Flat Rate Box", dimensions: "11 × 8.5 × 5.5 in" },
  { id: "usps_large_flat_rate_box", name: "USPS Large Flat Rate Box", dimensions: "12 × 12 × 5.5 in" },
  { id: "fedex_small_box", name: "FedEx Small Box", dimensions: "12.25 × 10.75 × 1.5 in" },
  { id: "fedex_medium_box", name: "FedEx Medium Box", dimensions: "13.25 × 11.5 × 2.38 in" },
  { id: "ups_small_box", name: "UPS Small Box", dimensions: "13 × 11 × 2 in" },
]

export function ParcelDetailsStep({ shipmentData, onUpdate, onNext, onPrev, isLoading }: ParcelDetailsStepProps) {
  const { toast } = useToast()
  const [parcelData, setParcelData] = useState<ParcelData>({
    length: "",
    width: "",
    height: "",
    weight: "",
    distanceUnit: "in",
    massUnit: "oz",
    template: "custom",
  })

  const handleInputChange = (field: keyof ParcelData, value: string) => {
    setParcelData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTemplateSelect = (template: string) => {
    setParcelData((prev) => ({ ...prev, template }))

    // Auto-fill dimensions for known templates
    switch (template) {
      case "usps_small_flat_rate_box":
        setParcelData((prev) => ({ ...prev, length: "8.5", width: "5.5", height: "1.625" }))
        break
      case "usps_medium_flat_rate_box":
        setParcelData((prev) => ({ ...prev, length: "11", width: "8.5", height: "5.5" }))
        break
      case "usps_large_flat_rate_box":
        setParcelData((prev) => ({ ...prev, length: "12", width: "12", height: "5.5" }))
        break
      case "fedex_small_box":
        setParcelData((prev) => ({ ...prev, length: "12.25", width: "10.75", height: "1.5" }))
        break
      case "fedex_medium_box":
        setParcelData((prev) => ({ ...prev, length: "13.25", width: "11.5", height: "2.38" }))
        break
      case "ups_small_box":
        setParcelData((prev) => ({ ...prev, length: "13", width: "11", height: "2" }))
        break
      default:
        // Custom - don't auto-fill
        break
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!parcelData.length || !parcelData.width || !parcelData.height || !parcelData.weight) {
        toast({
          title: "Missing Information",
          description: "Please fill in all parcel dimensions and weight",
          variant: "destructive",
        })
        return
      }

      // Create parcel object (fields must match what ShippingRatesStep expects)
      const parcel = {
        id: crypto.randomUUID(),
        length: Number.parseFloat(parcelData.length),
        width: Number.parseFloat(parcelData.width),
        height: Number.parseFloat(parcelData.height),
        weight: Number.parseFloat(parcelData.weight),
        distance_unit: parcelData.distanceUnit,
        mass_unit: parcelData.massUnit,
        parcel_template: parcelData.template !== "custom" ? parcelData.template : null,
        created_at: new Date().toISOString(),
      }

      // Save to database
      const { data, error } = await supabase.from("parcels").insert([parcel]).select().single()

      if (error) throw error

      // Pass the correct fields for rate calculation (not just DB record)
      onUpdate({
        parcel: {
          length: parcel.length,
          width: parcel.width,
          height: parcel.height,
          weight: parcel.weight,
          distance_unit: parcel.distance_unit,
          mass_unit: parcel.mass_unit,
          parcel_template: parcel.parcel_template,
        },
      })
      onNext()
    } catch (error) {
      console.error("Error saving parcel:", error)
      toast({
        title: "Error",
        description: "Failed to save parcel details",
        variant: "destructive",
      })
    }
  }

  const isFormValid = () => {
    return parcelData.length && parcelData.width && parcelData.height && parcelData.weight
  }

  return (
    <div className="space-y-6">
      {/* Package Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={parcelData.template} onValueChange={handleTemplateSelect}>
            <div className="grid gap-3">
              {PARCEL_TEMPLATES.map((template) => (
                <div key={template.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={template.id} id={template.id} />
                  <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                    <div className="font-medium">{template.name}</div>
                    {template.dimensions && <div className="text-sm text-muted-foreground">{template.dimensions}</div>}
                    {template.description && (
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Unit</Label>
            <Select
              value={parcelData.distanceUnit}
              onValueChange={(value: "in" | "cm") => handleInputChange("distanceUnit", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inches</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="length">Length *</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                min="0"
                value={parcelData.length}
                onChange={(e) => handleInputChange("length", e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="width">Width *</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                min="0"
                value={parcelData.width}
                onChange={(e) => handleInputChange("width", e.target.value)}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="height">Height *</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                min="0"
                value={parcelData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Weight
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Unit</Label>
            <Select
              value={parcelData.massUnit}
              onValueChange={(value: "oz" | "lb" | "g" | "kg") => handleInputChange("massUnit", value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oz">Ounces</SelectItem>
                <SelectItem value="lb">Pounds</SelectItem>
                <SelectItem value="g">Grams</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weight">Weight *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              value={parcelData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              placeholder="0.0"
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {isFormValid() && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Package Summary:</h4>
            <div className="text-sm space-y-1">
              <div>
                <strong>Dimensions:</strong> {parcelData.length} × {parcelData.width} × {parcelData.height}{" "}
                {parcelData.distanceUnit}
              </div>
              <div>
                <strong>Weight:</strong> {parcelData.weight} {parcelData.massUnit}
              </div>
              {parcelData.template !== "custom" && (
                <div>
                  <strong>Template:</strong> {PARCEL_TEMPLATES.find((t) => t.id === parcelData.template)?.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
          Continue to Shipping Rates
        </Button>
      </div>
    </div>
  )
}
