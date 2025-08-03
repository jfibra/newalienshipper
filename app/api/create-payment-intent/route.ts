import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, metadata } = await request.json()

    // In a real implementation, you would create a Stripe payment intent here
    // For demo purposes, we'll return a mock payment intent
    const mockPaymentIntent = {
      payment_intent_id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: "requires_payment_method",
      metadata,
    }

    return NextResponse.json(mockPaymentIntent)
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
