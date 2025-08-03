import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {

    // Ensure mass_unit is set to 'oz' for all parcels
    const shipmentData = await request.json();
    if (shipmentData.parcels && Array.isArray(shipmentData.parcels)) {
      shipmentData.parcels = shipmentData.parcels.map((parcel: any) => ({
        ...parcel,
        mass_unit: 'oz',
      }));
    }

    const response = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Shippo API Error:", errorData)
      return NextResponse.json({ error: "Failed to fetch shipping rates" }, { status: response.status })
    }

    const data = await response.json()

    // Transform the rates data to match our interface
    const transformedRates =
      data.rates?.map((rate: any) => ({
        carrier: rate.provider,
        service: rate.servicelevel.name,
        amount: rate.amount,
        currency: rate.currency,
        estimated_days: rate.estimated_days,
        retail_rate: rate.retail_rate,
      })) || []

    return NextResponse.json({ rates: transformedRates })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
