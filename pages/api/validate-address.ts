import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY
  if (!SHIPPO_API_KEY) {
    return res.status(500).json({ error: "Shippo API key not set" })
  }
  try {
    const response = await fetch("https://api.goshippo.com/addresses/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      },
      body: JSON.stringify({ ...req.body, validate: true }),
    })
    const data = await response.json()
    if (!response.ok) {
      return res.status(400).json({ error: data.detail || "Failed to validate address" })
    }
    return res.status(200).json(data)
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Internal server error" })
  }
}
