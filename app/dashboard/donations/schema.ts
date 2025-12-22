import { z } from "zod"

export const donationSchema = z.object({
    devotee_id: z.string().min(1, "Devotee is required"),
    donation_date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    category_id: z.string().optional(),
    purpose: z.string().optional(),
    payment_mode: z.enum(["Cash", "Online Transfer", "UPI", "Cheque", "Card", "DD"]),
    transaction_ref: z.string().optional(),
    payment_status: z.enum(["Completed", "Pending", "Failed", "Refunded"]).optional().default("Completed"),
    receipt_generated: z.boolean().optional().default(false),
})

export type DonationFormValues = z.infer<typeof donationSchema>
