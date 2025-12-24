import { z } from "zod"

export const budgetSchema = z.object({
    financial_year: z.string().min(1, "Financial year is required"),
    account_id: z.string().min(1, "Account is required"),
    budgeted_amount: z.coerce.number().min(0, "Budgeted amount must be greater than or equal to 0"),
})

export type BudgetFormValues = z.infer<typeof budgetSchema>

