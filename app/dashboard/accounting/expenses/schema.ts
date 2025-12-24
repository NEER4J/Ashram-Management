import { z } from "zod"

export const expenseSchema = z.object({
    expense_date: z.string().min(1, "Expense date is required"),
    expense_category_id: z.string().min(1, "Expense category is required"),
    vendor_id: z.string().optional(),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    gst_rate: z.coerce.number().min(0).max(100).optional().default(0),
    description: z.string().optional(),
    payment_status: z.enum(["Unpaid", "Paid"]).optional().default("Unpaid"),
    payment_mode: z.enum(["Cash", "Cheque", "Online Transfer", "UPI", "Card", "DD"]).optional(),
    bank_account_id: z.string().optional(),
    reference_number: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

