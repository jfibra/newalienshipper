export interface Country {
  name: string
  code: string
}

export interface UserProfile {
  id: string
  full_name?: string
  email?: string
  phone?: string
  company?: string
}

export interface BaseAddress {
  id?: string
  user_id: string
  full_name: string
  email?: string
  company?: string
  city: string
  state: string
  postal_code: string
  country: string
  country_code: string
  address_type: "residential" | "commercial" | "warehouse" | "government" | "pickup_point" | "other"
  created_at?: string
  updated_at?: string
}

export interface RecipientAddress extends BaseAddress {
  phone_number?: string
  street1: string
  street2?: string
  is_default?: boolean
}

export interface ShippingAddress extends BaseAddress {
  phone?: string
  address_line1: string
  address_line2?: string
  usage_type: "shipping" | "return" | "both"
}

export interface LocationIQSuggestion {
  place_id: string
  licence: string
  osm_type: string
  osm_id: string
  boundingbox: string[]
  lat: string
  lon: string
  display_name: string
  class: string
  type: string
  importance: number
  address: {
    house_number?: string
    road?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    county?: string
    state?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}
