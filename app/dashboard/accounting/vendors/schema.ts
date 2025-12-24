import { z } from "zod"

export const vendorSchema = z.object({
    vendor_code: z.string().optional(),
    name: z.string().min(1, "Vendor name is required"),
    gstin: z.string().optional(),
    contact_person: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional().default("India"),
    payment_terms: z.string().optional(),
    is_active: z.boolean().optional().default(true),
})

export type VendorFormValues = z.infer<typeof vendorSchema>

