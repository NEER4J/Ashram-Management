import { z } from "zod"

export const chartOfAccountSchema = z.object({
    account_code: z.string().min(1, "Account code is required"),
    account_name: z.string().min(1, "Account name is required"),
    account_type: z.enum(["Asset", "Liability", "Income", "Expense", "Equity"]),
    parent_account_id: z.string().optional(),
    is_gst_applicable: z.boolean().optional().default(false),
    gst_rate: z.coerce.number().min(0).max(100).optional().default(0),
    opening_balance: z.coerce.number().optional().default(0),
    description: z.string().optional(),
    is_active: z.boolean().optional().default(true),
})

export type ChartOfAccountFormValues = z.infer<typeof chartOfAccountSchema>
