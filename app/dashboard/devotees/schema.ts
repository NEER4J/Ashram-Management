import { z } from "zod"

export const devoteeSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    mobile_number: z.string().min(10, "Valid mobile number is required"),
    whatsapp_number: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    date_of_birth: z.date().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default("India"),
    pincode: z.string().optional(),
    gotra: z.string().optional(),
    nakshatra: z.string().optional(),
    rashi: z.string().optional(),
    occupation: z.string().optional(),
    event_source: z.string().optional(),
    membership_type: z.string().default("General"),
    membership_status: z.string().default("Active"),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    medical_notes: z.string().optional(),
    dietary_preferences: z.string().optional(),
    photo_url: z.string().optional(),
    relationship_status: z.enum(["Active", "Inactive", "Lapsed"]).default("Active"),
    first_visit_date: z.string().optional(), // YYYY-MM-DD
    last_visit_date: z.string().optional(),
    spiritual_notes: z.string().optional(),
})

export type DevoteeFormValues = z.infer<typeof devoteeSchema>
