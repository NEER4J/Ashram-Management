import { z } from "zod"

export const bankAccountSchema = z.object({
    account_name: z.string().min(1, "Account name is required"),
    account_number: z.string().optional(),
    bank_name: z.string().min(1, "Bank name is required"),
    ifsc_code: z.string().optional(),
    branch: z.string().optional(),
    account_type: z.enum(["Savings", "Current", "Fixed Deposit"]),
    opening_balance: z.coerce.number().optional().default(0),
    is_active: z.boolean().optional().default(true),
})

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>

