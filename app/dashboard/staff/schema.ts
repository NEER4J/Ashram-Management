import { z } from "zod"

export const staffSchema = z.object({
    first_name: z.string().min(2, "First Name is required"),
    last_name: z.string().optional(),
    role: z.string().optional().default("Pandit ji"),
    mobile_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    is_active: z.boolean().optional().default(true),
    // Pandit ji specific fields can be added here
})

export type StaffFormValues = z.infer<typeof staffSchema>
