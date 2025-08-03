export interface Parcel {
  id: string
  length: number
  width: number
  height: number
  distance_unit: string
  weight: number
  mass_unit: string
  parcel_template?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface ShippingRate {
  id: string
  provider: string
  service_level_name: string
  amount: string
  currency: string
  estimated_days: number | null
  duration_terms: string
  carrier_account: string
  attributes: any
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  shipment_id?: string
  user_id: string
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: string
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface Shipment {
  id: string
  user_id: string
  from_address_id: string
  to_address_id: string
  return_address_id: string
  parcel_id: string
  selected_rate_id: string
  tag?: string
  status: string
  tracking_number?: string
  label_url?: string
  shippo_shipment_id?: string
  shippo_label_id?: string
  stripe_payment_intent_id?: string
  amount_paid?: number
  currency: string
  metadata?: any
  created_at: string
  updated_at: string
}
