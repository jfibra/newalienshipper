"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentStepProps {
  shipmentData: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  user: any
}

export function PaymentStep({
  shipmentData,
  onUpdate,
  onNext,
  onPrev,
  isLoading,
  setIsLoading,
  user,
}: PaymentStepProps) {
  const { toast } = useToast()
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  const formatPrice = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const handlePayment = async () => {
    setPaymentProcessing(true)
    setIsLoading(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create payment record
      const payment = {
        id: crypto.randomUUID(),
        user_id: user.id,
        amount: shipmentData.selectedRate.amount,
        currency: shipmentData.selectedRate.currency,
        status: "succeeded",
        stripe_payment_intent_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        paid_at: new Date().toISOString(),
      }

      onUpdate({ payment })

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully",
      })

      onNext()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPaymentProcessing(false)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Shipping Service</span>
              <span className="text-sm font-medium">
                {shipmentData.selectedRate?.provider.toUpperCase()} {shipmentData.selectedRate?.service_level_name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Delivery Time</span>
              <span className="text-sm">
                {shipmentData.selectedRate?.estimated_days}{" "}
                {shipmentData.selectedRate?.estimated_days === 1 ? "day" : "days"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">From</span>
              <span className="text-sm text-right">
                {shipmentData.fromAddress?.full_name}
                <br />
                {shipmentData.fromAddress?.city}, {shipmentData.fromAddress?.state}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">To</span>
              <span className="text-sm text-right">
                {shipmentData.toAddress?.full_name}
                <br />
                {shipmentData.toAddress?.city}, {shipmentData.toAddress?.state}
              </span>
            </div>

            {shipmentData.tag && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Reference</span>
                <span className="text-sm">{shipmentData.tag}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(shipmentData.selectedRate?.amount, shipmentData.selectedRate?.currency)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">•••• •••• •••• 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/25</div>
              </div>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={paymentProcessing}>
          Previous
        </Button>
        <Button onClick={handlePayment} disabled={paymentProcessing} className="min-w-[140px]">
          {paymentProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Pay {formatPrice(shipmentData.selectedRate?.amount, shipmentData.selectedRate?.currency)}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
