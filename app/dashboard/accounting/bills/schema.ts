import { z } from "zod"

export const billSchema = z.object({
    vendor_id: z.string().min(1, "Vendor is required"),
    bill_date: z.string().min(1, "Bill date is required"),
    due_date: z.string().optional(),
    subtotal: z.coerce.number().min(0.01, "Subtotal must be greater than 0"),
    gst_rate: z.coerce.number().min(0).max(100).optional().default(0),
    description: z.string().optional(),
})

export type BillFormValues = z.infer<typeof billSchema>

export const billPaymentSchema = z.object({
    bill_id: z.string().min(1, "Bill is required"),
    payment_date: z.string().min(1, "Payment date is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    payment_mode: z.enum(["Cash", "Cheque", "Online Transfer", "UPI", "Card", "DD"]),
    bank_account_id: z.string().optional(),
    reference_number: z.string().optional(),
    description: z.string().optional(),
})

export type BillPaymentFormValues = z.infer<typeof billPaymentSchema>

