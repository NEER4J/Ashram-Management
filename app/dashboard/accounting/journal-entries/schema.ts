import { z } from "zod"

export const journalEntryLineSchema = z.object({
    account_id: z.string().min(1, "Account is required"),
    description: z.string().optional(),
    debit_amount: z.coerce.number().min(0).optional().default(0),
    credit_amount: z.coerce.number().min(0).optional().default(0),
})

export const journalEntrySchema = z.object({
    entry_date: z.string().min(1, "Entry date is required"),
    description: z.string().optional(),
    lines: z.array(journalEntryLineSchema).min(2, "At least 2 lines required"),
}).refine(
    (data) => {
        const totalDebit = data.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0)
        const totalCredit = data.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0)
        return Math.abs(totalDebit - totalCredit) < 0.01 // Allow small rounding differences
    },
    {
        message: "Total debits must equal total credits",
        path: ["lines"],
    }
).refine(
    (data) => {
        return data.lines.every(line => {
            const hasDebit = (line.debit_amount || 0) > 0
            const hasCredit = (line.credit_amount || 0) > 0
            return hasDebit !== hasCredit // Exactly one must be > 0
        })
    },
    {
        message: "Each line must have either debit or credit, not both",
        path: ["lines"],
    }
)

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>
export type JournalEntryLineFormValues = z.infer<typeof journalEntryLineSchema>

