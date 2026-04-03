import { z } from "zod"

export const eventRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Valid mobile number is required"),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    dob: z.string().min(1, "Date of birth is required"),
    occupation: z.string().min(1, "Occupation is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
})

export type EventRegistrationFormValues = z.infer<typeof eventRegistrationSchema>

