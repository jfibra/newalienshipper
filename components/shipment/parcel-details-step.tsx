"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Package, Ruler, Weight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ParcelDetailsStepProps {
  shipmentData: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isLoading: boolean
}

const PARCEL_TEMPLATES = [
  { id: "custom", name: "Custom Dimensions", dimensions: null },
  { id: "small_box", name: "Small Box", dimensions: { length: 8, width: 6, height: 4, weight: 1 } },
  { id: "medium_box", name: "Medium Box", dimensions: { length: 12, width: 9, height: 6, weight: 2 } },
  { id: "large_box", name: "Large Box", dimensions: { length: 16, width: 12, height: 8, weight: 5 } },
  { id: "envelope", name: "Envelope", dimensions: { length: 12, width: 9, height: 0.5, weight: 0.5 } },
  { id: "tube", name: "Tube", dimensions: { length: 24, width: 4, height: 4, weight: 1 } },
]

export function ParcelDetailsStep({ shipmentData, onUpdate, onNext, onPrev, isLoading }: ParcelDetailsStepProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    length: shipmentData.parcel?.length || "",
    width: shipmentData.parcel?.width || "",
    height: shipmentData.parcel?.height || "",
    weight: shipmentData.parcel?.weight || "",
    distance_unit: shipmentData.parcel?.distance_unit || "in",
    mass_unit: shipmentData.parcel?.mass_unit || "oz",
    parcel_template: shipmentData.parcel?.parcel_template || "custom",
  })

  const handleTemplateChange = (templateId: string) => {
    const template = PARCEL_TEMPLATES.find((t) => t.id === templateId)
    if (template && template.dimensions) {
      setFormData((prev) => ({
        ...prev,
        parcel_template: templateId,
        length: template.dimensions!.length.toString(),
        width: template.dimensions!.width.toString(),
        height: template.dimensions!.height.toString(),
        weight: template.dimensions!.weight.toString(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        parcel_template: templateId,
      }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.length || !formData.width || !formData.height || !formData.weight) {
        toast({
          title: "Error",
          description: "Please fill in all parcel dimensions and weight",
          variant: "destructive",
        })
        return
      }

      // Convert to numbers and validate
      const length = Number.parseFloat(formData.length)
      const width = Number.parseFloat(formData.width)
      const height = Number.parseFloat(formData.height)
      const weight = Number.parseFloat(formData.weight)

      if (length <= 0 || width <= 0 || height <= 0 || weight <= 0) {
        toast({
          title: "Error",
          description: "All dimensions and weight must be greater than 0",
          variant: "destructive",
        })
        return
      }

      // Save parcel to database
      const parcelData = {
        length,
        width,
        height,
        weight,
        distance_unit: formData.distance_unit,
        mass_unit: formData.mass_unit,
        parcel_template: formData.parcel_template,
      }

      const { data, error } = await supabase.from("parcels").insert([parcelData]).select().single()

      if (error) throw error

      // Update shipment data
      onUpdate({ parcel: data })
      onNext()

      toast({
        title: "Success",
        description: "Parcel details saved successfully",
      })
    } catch (error) {
      console.error("Error saving parcel:", error)
      toast({
        title: "Error",
        description: "Failed to save parcel details",
        variant: "destructive",
      })
    }
  }

  const isValid = formData.length && formData.width && formData.height && formData.weight

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div>
        <Label htmlFor="template">Parcel Template</Label>
        <Select value={formData.parcel_template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {PARCEL_TEMPLATES.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
                {template.dimensions && (
                  <span className="text-muted-foreground ml-2">
                    ({template.dimensions.length}"×{template.dimensions.width}"×{template.dimensions.height}",{" "}
                    {template.dimensions.weight}oz)
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a template or select "Custom Dimensions" to enter your own
        </p>
      </div>

      <Separator />

      {/* Dimensions */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Ruler className="h-5 w-5" />
          Dimensions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="length">Length *</Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.length}
              onChange={(e) => handleInputChange("length", e.target.value)}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="width">Width *</Label>
            <Input
              id="width"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.width}
              onChange={(e) => handleInputChange("width", e.target.value)}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height">Height *</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="distance_unit">Unit</Label>
            <Select value={formData.distance_unit} onValueChange={(value) => handleInputChange("distance_unit", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Inches</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Weight */}
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Weight className="h-5 w-5" />
          Weight
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.weight}
              onChange={(e) => handleInputChange("weight", e.target.value)}
              placeholder="0.0"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mass_unit">Unit</Label>
            <Select value={formData.mass_unit} onValueChange={(value) => handleInputChange("mass_unit", value)}>
              <SelectTrigger className="mt-1">
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
        </div>
      </div>

      {/* Preview */}
      {isValid && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parcel Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Dimensions:</strong> {formData.length}" × {formData.width}" × {formData.height}"
              </div>
              <div>
                <strong>Weight:</strong> {formData.weight} {formData.mass_unit}
              </div>
              <div>
                <strong>Template:</strong> {PARCEL_TEMPLATES.find((t) => t.id === formData.parcel_template)?.name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
          {isLoading ? "Saving..." : "Continue to Rates"}
        </Button>
      </div>
    </div>
  )
}
