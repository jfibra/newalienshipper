import { z } from "zod"

const baseAddressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  company: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  country_code: z.string().min(2, "Country code is required"),
  address_type: z.enum(["residential", "commercial", "warehouse", "government", "pickup_point", "other"]),
})

export const recipientAddressSchema = baseAddressSchema.extend({
  phone_number: z.string().optional(),
  street1: z.string().min(1, "Street address is required"),
  street2: z.string().optional(),
  is_default: z.boolean().optional(),
})

export const shippingAddressSchema = baseAddressSchema.extend({
  phone: z.string().optional(),
  address_line1: z.string().min(1, "Street address is required"),
  address_line2: z.string().optional(),
  usage_type: z.enum(["shipping", "return", "both"]),
  is_default: z.boolean().optional(),
})

export type RecipientAddressFormData = z.infer<typeof recipientAddressSchema>
export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>
