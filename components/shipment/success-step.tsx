"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, Package, Truck, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SuccessStepProps {
  shipmentData: any
  onCreateAnother: () => void
  onGoToDashboard: () => void
}

export function SuccessStep({ shipmentData, onCreateAnother, onGoToDashboard }: SuccessStepProps) {
  const { toast } = useToast()

  const shipment = shipmentData.shipment
  const payment = shipmentData.payment
  const selectedRate = shipmentData.selectedRate

  const copyTrackingNumber = () => {
    if (shipment?.tracking_number) {
      navigator.clipboard.writeText(shipment.tracking_number)
      toast({
        title: "Copied",
        description: "Tracking number copied to clipboard",
      })
    }
  }

  const downloadLabel = () => {
    if (shipment?.label_url) {
      window.open(shipment.label_url, "_blank")
    }
  }

  const formatEstimatedDays = (days: number | null) => {
    if (!days) return "Unknown"
    if (days === 1) return "1 business day"
    return `${days} business days`
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Shipment Created Successfully!</h2>
        <p className="text-muted-foreground">Your shipment has been created and payment has been processed.</p>
      </div>

      {/* Shipment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {shipmentData.tag && (
            <div className="flex justify-between">
              <span className="font-medium">Reference:</span>
              <Badge variant="secondary">{shipmentData.tag}</Badge>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">Service:</span>
            <span>
              {selectedRate?.provider} - {selectedRate?.service_level_name}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Cost:</span>
            <span>
              ${Number.parseFloat(selectedRate?.amount || "0").toFixed(2)} {selectedRate?.currency}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Estimated Delivery:</span>
            <span>{formatEstimatedDays(selectedRate?.estimated_days)}</span>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>From:</span>
              <span>{shipmentData.fromAddress?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>To:</span>
              <span>{shipmentData.toAddress?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Return:</span>
              <span>{shipmentData.returnAddress?.full_name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Information */}
      {shipment?.tracking_number && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Tracking Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Tracking Number</div>
                <div className="text-lg font-mono">{shipment.tracking_number}</div>
              </div>
              <Button variant="outline" size="sm" onClick={copyTrackingNumber}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Label */}
      {shipment?.label_url && (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Label</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">Label Ready</div>
                <div className="text-sm text-muted-foreground">Download and print your shipping label</div>
              </div>
              <Button onClick={downloadLabel}>
                <Download className="h-4 w-4 mr-2" />
                Download Label
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <Badge className="bg-green-100 text-green-800">
              {payment?.status === "succeeded" ? "Paid" : payment?.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span>
              ${Number.parseFloat(payment?.amount || "0").toFixed(2)} {payment?.currency}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Payment ID:</span>
            <span className="font-mono text-xs">{payment?.stripe_payment_intent_id}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button onClick={onCreateAnother} variant="outline" className="flex-1 bg-transparent">
          <Package className="h-4 w-4 mr-2" />
          Create Another Shipment
        </Button>
        <Button onClick={onGoToDashboard} className="flex-1">
          Go to Dashboard
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
