import { z } from "zod"

export const pujaBookingSchema = z.object({
    devotee_id: z.string().min(1, "Devotee is required"),
    puja_id: z.string().min(1, "Puja type is required"),
    booking_date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
    puja_date: z.string().min(1, "Puja date is required"),
    puja_time: z.string().min(1, "Puja time is required"),
    assigned_priest_id: z.string().optional(),
    status: z.enum(["Confirmed", "Completed", "Cancelled", "Pending"]).optional().default("Confirmed"),
    payment_status: z.enum(["Pending", "Partial", "Paid", "Refunded"]).optional().default("Pending"),
    amount_paid: z.coerce.number().min(0).optional().default(0),
    participant_details: z.any().optional(), // JSONB field for participants
})

export type PujaBookingFormValues = z.infer<typeof pujaBookingSchema>
