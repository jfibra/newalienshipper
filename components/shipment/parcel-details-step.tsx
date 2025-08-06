"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Package, Ruler, Weight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ParcelDetailsStepProps {
  shipmentData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

interface ParcelData {
  length: string;
  width: string;
  height: string;
  weight: string;
  distanceUnit: "in" | "cm";
  massUnit: "oz" | "lb" | "g" | "kg";
  template: string;
}

// --- Import full presetParcels from calculator ---
const presetParcels = [
  {
    id: "USPS_FlatRateEnvelope",
    name: "Flat Rate Envelope",
    carrier: "USPS",
    description: "Up to 70 lbs",
  },
  {
    id: "USPS_FlatRateLegalEnvelope",
    name: "Flat Rate Legal Envelope",
    carrier: "USPS",
    description: "Up to 70 lbs",
  },
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
  {
    id: "USPS_MediumFlatRateBox",
    name: "Medium Flat Rate Box",
    carrier: "USPS",
    description: '11" x 8 1/2" x 5 1/2"',
  },
  {
    id: "USPS_LargeFlatRateBox",
    name: "Large Flat Rate Box",
    carrier: "USPS",
    description: '12" x 12" x 6"',
  },
  {
    id: "USPS_RegionalRateBoxA",
    name: "Regional Rate Box A",
    carrier: "USPS",
    description: '10" x 7" x 4 3/4"',
  },
  {
    id: "USPS_RegionalRateBoxB",
    name: "USPS Regional Rate Box B",
    carrier: "USPS",
    description: '12" x 10 1/4" x 5"',
  },
  {
    id: "USPS_LargeFlatRateBoardGameBox",
    name: "Large Flat Rate Board Game Box",
    carrier: "USPS",
    description: '24" x 11 7/8" x 3 1/8"',
  },
  {
    id: "UPS_Box_10kg",
    name: "UPS Box 10kg",
    carrier: "UPS",
    description: "Any rigid box or thick parcel",
  },
  {
    id: "UPS_Box_25kg",
    name: "UPS Box 25kg",
    carrier: "UPS",
    description: "Any rigid box or thick parcel",
  },
  {
    id: "UPS_Express_Box",
    name: "UPS Express Box",
    carrier: "UPS",
    description: '13" x 11" x 2"',
  },
  {
    id: "UPS_Express_Box_Large",
    name: "UPS Express Box Large",
    carrier: "UPS",
    description: '18" x 13" x 3"',
  },
  {
    id: "UPS_Express_Envelope",
    name: "UPS Express Envelope",
    carrier: "UPS",
    description: '12 1/2" x 9 1/2"',
  },
  {
    id: "UPS_Express_Hard_Pak",
    name: "UPS Express Hard Pak",
    carrier: "UPS",
    description: '14" x 11" x 2"',
  },
  {
    id: "UPS_Express_Legal_Envelope",
    name: "UPS Express Legal Envelope",
    carrier: "UPS",
    description: '15" x 9 1/2"',
  },
  {
    id: "UPS_Express_Pak",
    name: "UPS Express Pak",
    carrier: "UPS",
    description: '16" x 12 3/4"',
  },
  {
    id: "UPS_Express_Tube",
    name: "UPS Express Tube",
    carrier: "UPS",
    description: '38" x 6" x 6"',
  },
  {
    id: "FedEx_Box_10kg",
    name: "FedEx Box 10kg",
    carrier: "FedEx",
    description: '15.81" x 12.94" x 10.19"',
  },
  {
    id: "FedEx_Box_25kg",
    name: "FedEx Box 25kg",
    carrier: "FedEx",
    description: '54.80" x 42.10" x 33.50"',
  },
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
  {
    id: "FedEx_Box_Large_1",
    name: "FedEx Box Large 1",
    carrier: "FedEx",
    description: '8.75" x 7.75" x 4.75"',
  },
  {
    id: "FedEx_Box_Large_2",
    name: "FedEx Box Large 2",
    carrier: "FedEx",
    description: '11.25" x 8.75" x 7.75"',
  },
  {
    id: "FedEx_Box_Medium_1",
    name: "FedEx Box Medium 1",
    carrier: "FedEx",
    description: '8.75" x 2.63" x 11.25"',
  },
  {
    id: "FedEx_Box_Medium_2",
    name: "FedEx Box Medium 2",
    carrier: "FedEx",
    description: '11.25" x 8.75" x 4.38"',
  },
  {
    id: "FedEx_Box_Small_1",
    name: "FedEx Box Small 1",
    carrier: "FedEx",
    description: '12.38" x 10.88" x 1.50"',
  },
  {
    id: "FedEx_Box_Small_2",
    name: "FedEx Box Small 2",
    carrier: "FedEx",
    description: '8.75" x 11.25" x 4.38"',
  },
  {
    id: "FedEx_Envelope",
    name: "FedEx Envelope",
    carrier: "FedEx",
    description: '12.50" x 9.50"',
  },
  {
    id: "FedEx_Padded_Pak",
    name: "FedEx Padded Pak",
    carrier: "FedEx",
    description: '11.75" x 14.75"',
  },
  {
    id: "FedEx_Pak",
    name: "FedEx Pak",
    carrier: "FedEx",
    description: '15.50" x 12.00"',
  },
  {
    id: "FedEx_Tube",
    name: "FedEx Tube",
    carrier: "FedEx",
    description: '38" x 6" x 6"',
  },
];

const groupedParcels = presetParcels.reduce((acc, parcel) => {
  if (!acc[parcel.carrier]) acc[parcel.carrier] = [];
  acc[parcel.carrier].push(parcel);
  return acc;
}, {} as Record<string, typeof presetParcels>);

export function ParcelDetailsStep({
  shipmentData,
  onUpdate,
  onNext,
  onPrev,
  isLoading,
}: ParcelDetailsStepProps) {
  const { toast } = useToast();
  const [parcelData, setParcelData] = useState<ParcelData>({
    length: "",
    width: "",
    height: "",
    weight: "",
    distanceUnit: "in",
    massUnit: "oz",
    template: "custom",
  });

  // Place the useEffect here, after useState and before return
  useEffect(() => {
    if (
      parcelData.template === "custom" &&
      (!parcelData.length || !parcelData.width || !parcelData.height)
    ) {
      setParcelData((prev) => ({
        ...prev,
        length: "10",
        width: "8",
        height: "4",
        distanceUnit: "in",
      }));
    }
  }, [parcelData.template]);

  const handleInputChange = (field: keyof ParcelData, value: string) => {
    setParcelData((prev) => ({ ...prev, [field]: value }));
  };

  // Move handleTemplateSelect above the return statement
  const handleTemplateSelect = (template: string) => {
    setParcelData((prev) => ({ ...prev, template }));
    if (template === "custom") {
      // Set default dimensions for custom (required by Shippo API)
      setParcelData((prev) => ({
        ...prev,
        length: "10",
        width: "8",
        height: "4",
        distanceUnit: "in",
      }));
      return;
    }
    // Try to auto-fill dimensions if available in description (e.g. '12" x 10" x 5"')
    const selected = presetParcels.find((p) => p.id === template);
    if (selected && selected.description) {
      const match = selected.description.match(
        /([\d.]+)["']?\s*[x×]\s*([\d.]+)["']?\s*[x×]\s*([\d.]+)["']?/i
      );
      if (match) {
        setParcelData((prev) => ({
          ...prev,
          length: match[1],
          width: match[2],
          height: match[3],
          distanceUnit: "in",
          weight: prev.weight || "",
        }));
      }
    }
  };

  // Replace old PARCEL_TEMPLATES and radio group with dropdown selection
  return (
    <div className="space-y-6">
      {/* Package Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Predefined Package (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={parcelData.template}
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {parcelData.template === "custom"
                  ? "Custom dimensions"
                  : (() => {
                      const selected = presetParcels.find(
                        (p) => p.id === parcelData.template
                      );
                      return selected
                        ? `${selected.carrier}: ${selected.name}`
                        : "Select a package";
                    })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-80 w-full">
              <SelectItem value="custom">Custom dimensions</SelectItem>
              {Object.entries(groupedParcels).map(([carrier, parcels]) => (
                <div key={carrier}>
                  <div className="px-3 py-2 text-sm font-bold text-gray-700 bg-gray-50 sticky top-0 border-b">
                    {carrier} Packages
                  </div>
                  {parcels.map((parcel) => (
                    <SelectItem
                      key={parcel.id}
                      value={parcel.id}
                      className="pl-6 py-3"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className="font-medium">{parcel.name}</div>
                        {parcel.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {parcel.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
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
              onValueChange={(value: "in" | "cm") =>
                handleInputChange("distanceUnit", value)
              }
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
              onValueChange={(value: "oz" | "lb" | "g" | "kg") =>
                handleInputChange("massUnit", value)
              }
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
                <strong>Dimensions:</strong> {parcelData.length} ×{" "}
                {parcelData.width} × {parcelData.height}{" "}
                {parcelData.distanceUnit}
              </div>
              <div>
                <strong>Weight:</strong> {parcelData.weight}{" "}
                {parcelData.massUnit}
              </div>
              {parcelData.template !== "custom" && (
                <div>
                  <strong>Template:</strong>{" "}
                  {(() => {
                    const found = presetParcels.find(
                      (t) => t.id === parcelData.template
                    );
                    return found ? found.name : parcelData.template;
                  })()}
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
  );

  // Add/fix isFormValid and handleSubmit
  function isFormValid() {
    return (
      parcelData.length &&
      parcelData.width &&
      parcelData.height &&
      parcelData.weight
    );
  }

  async function handleSubmit() {
    try {
      if (!isFormValid()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all parcel dimensions and weight",
          variant: "destructive",
        });
        return;
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
        parcel_template:
          parcelData.template !== "custom" ? parcelData.template : null,
        created_at: new Date().toISOString(),
      };
      // Save to database
      const { data, error } = await supabase
        .from("parcels")
        .insert([parcel])
        .select()
        .single();
      if (error) throw error;
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
      });
      onNext();
    } catch (error) {
      console.error("Error saving parcel:", error);
      toast({
        title: "Error",
        description: "Failed to save parcel details",
        variant: "destructive",
      });
    }
  }
}
