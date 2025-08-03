"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Package, Truck, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SuccessStepProps {
  shipmentData: any
  onCreateAnother: () => void
  onGoToDashboard: () => void
}

export function SuccessStep({ shipmentData, onCreateAnother, onGoToDashboard }: SuccessStepProps) {
  const { toast } = useToast()

  const formatPrice = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const handleCopyTracking = () => {
    const trackingNumber = "1Z999AA1234567890" // Mock tracking number
    navigator.clipboard.writeText(trackingNumber)
    toast({
      title: "Copied!",
      description: "Tracking number copied to clipboard",
    })
  }

  const handleDownloadLabel = () => {
    // Mock label download
    toast({
      title: "Download Started",
      description: "Your shipping label is being downloaded",
    })
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Shipment Created Successfully!</h2>
        <p className="text-muted-foreground">Your shipping label has been generated and payment has been processed.</p>
      </div>

      {/* Shipment Details */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Shipment Details</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Paid
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground mb-1">From</div>
              <div>{shipmentData.fromAddress?.full_name}</div>
              <div className="text-muted-foreground">
                {shipmentData.fromAddress?.city}, {shipmentData.fromAddress?.state}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground mb-1">To</div>
              <div>{shipmentData.toAddress?.full_name}</div>
              <div className="text-muted-foreground">
                {shipmentData.toAddress?.city}, {shipmentData.toAddress?.state}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground mb-1">Service</div>
              <div>
                {shipmentData.selectedRate?.provider.toUpperCase()} {shipmentData.selectedRate?.service_level_name}
              </div>
              <div className="text-muted-foreground">
                {shipmentData.selectedRate?.estimated_days}{" "}
                {shipmentData.selectedRate?.estimated_days === 1 ? "day" : "days"}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground mb-1">Cost</div>
              <div className="text-lg font-semibold">
                {formatPrice(shipmentData.selectedRate?.amount, shipmentData.selectedRate?.currency)}
              </div>
            </div>

            {shipmentData.tag && (
              <div className="md:col-span-2">
                <div className="font-medium text-muted-foreground mb-1">Reference</div>
                <div>{shipmentData.tag}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Information */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Tracking Information</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="font-medium">Tracking Number</div>
              <div className="text-lg font-mono">1Z999AA1234567890</div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyTracking}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Next Steps</h3>
          </div>

          <div className="space-y-3">
            <Button onClick={handleDownloadLabel} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Shipping Label
            </Button>

            <div className="text-sm text-muted-foreground">
              Print your shipping label and attach it to your package. Make sure the barcode is clearly visible.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onCreateAnother} className="flex-1 bg-transparent">
          Create Another Shipment
        </Button>
        <Button onClick={onGoToDashboard} className="flex-1">
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
