"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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

  const selectedRate = shipmentData.selectedRate
  const amount = selectedRate ? Number.parseFloat(selectedRate.amount) : 0
  const currency = selectedRate?.currency || "USD"

  const handlePayment = async () => {
    setPaymentProcessing(true)
    setIsLoading(true)

    try {
      // Create payment intent
      const paymentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            shipment_tag: shipmentData.tag || "",
            from_address: shipmentData.fromAddress?.full_name,
            to_address: shipmentData.toAddress?.full_name,
          },
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Failed to create payment intent")
      }

      const paymentData = await paymentResponse.json()

      // For demo purposes, we'll simulate a successful payment
      // In a real app, you'd integrate with Stripe Elements here
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Save payment to database
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            user_id: user.id,
            stripe_payment_intent_id: paymentData.payment_intent_id,
            amount,
            currency,
            status: "succeeded",
            paid_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (paymentError) throw paymentError

      // Create shipment record
      const { data: shipment, error: shipmentError } = await supabase
        .from("shipments")
        .insert([
          {
            user_id: user.id,
            from_address_id: shipmentData.fromAddress.id,
            to_address_id: shipmentData.toAddress.id,
            return_address_id: shipmentData.returnAddress.id,
            parcel_id: shipmentData.parcel.id,
            selected_rate_id: shipmentData.selectedRate.id,
            tag: shipmentData.tag || null,
            status: "processing",
            stripe_payment_intent_id: paymentData.payment_intent_id,
            amount_paid: amount,
            currency,
          },
        ])
        .select()
        .single()

      if (shipmentError) throw shipmentError

      // Update payment with shipment_id
      await supabase.from("payments").update({ shipment_id: shipment.id }).eq("id", payment.id)

      // Finalize shipment with Shippo (create label)
      const labelResponse = await fetch("/api/create-shipping-label", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shipment_id: shipment.id,
          rate_id: shipmentData.selectedRate.id,
        }),
      })

      if (labelResponse.ok) {
        const labelData = await labelResponse.json()

        // Update shipment with label info
        const { error: updateError } = await supabase
          .from("shipments")
          .update({
            tracking_number: labelData.tracking_number,
            label_url: labelData.label_url,
            shippo_shipment_id: labelData.shippo_shipment_id,
            shippo_label_id: labelData.shippo_label_id,
            status: "completed",
          })
          .eq("id", shipment.id)

        if (updateError) throw updateError

        // Update shipment data with final info
        onUpdate({
          payment,
          shipment: {
            ...shipment,
            tracking_number: labelData.tracking_number,
            label_url: labelData.label_url,
            status: "completed",
          },
        })
      } else {
        // Even if label creation fails, we have a paid shipment
        onUpdate({ payment, shipment })
      }

      toast({
        title: "Payment Successful",
        description: "Your shipment has been created and paid for",
      })

      onNext()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment",
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
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Shipping Service:</span>
              <span>
                {selectedRate?.provider} - {selectedRate?.service_level_name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>From:</span>
              <span>{shipmentData.fromAddress?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>To:</span>
              <span>{shipmentData.toAddress?.full_name}</span>
            </div>
            {shipmentData.tag && (
              <div className="flex justify-between text-sm">
                <span>Reference:</span>
                <span>{shipmentData.tag}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>
              ${amount.toFixed(2)} {currency}
            </span>
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
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This is a demo payment. In production, this would integrate with Stripe Elements for secure credit card
              processing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy.</p>
            <p>Your payment will be processed securely through Stripe.</p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} disabled={paymentProcessing}>
          Previous
        </Button>
        <Button onClick={handlePayment} disabled={paymentProcessing} className="bg-green-600 hover:bg-green-700">
          {paymentProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
