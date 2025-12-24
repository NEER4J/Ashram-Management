"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { JournalEntryFormValues, journalEntrySchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

interface JournalEntryFormProps {
    initialData?: Partial<JournalEntryFormValues> & { id?: string }
    onSuccess?: () => void
}

type AccountOption = {
    id: string
    account_code: string
    account_name: string
}

export function JournalEntryForm({ initialData, onSuccess }: JournalEntryFormProps) {
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState<AccountOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name")
                .eq("is_active", true)
                .order("account_code")
                .returns<AccountOption[]>()

            if (data) setAccounts(data)
        }
        fetchAccounts()
    }, [supabase])

    const form = useForm<JournalEntryFormValues>({
        resolver: zodResolver(journalEntrySchema) as any,
        defaultValues: {
            entry_date: initialData?.entry_date ?? new Date().toISOString().split('T')[0],
            description: initialData?.description ?? "",
            lines: initialData?.lines && initialData.lines.length > 0 
                ? initialData.lines 
                : [
                    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
                    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
                ],
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lines",
    })

    const generateEntryNumber = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `JRNL-${year}-`

        const { data: latestEntry } = await supabase
            .from("journal_entries")
            .select("entry_number")
            .like("entry_number", `${prefix}%`)
            .order("entry_number", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (latestEntry?.entry_number) {
            const match = latestEntry.entry_number.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: JournalEntryFormValues) {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            // Get current period
            const { data: period } = await supabase
                .from("financial_periods")
                .select("id")
                .eq("status", "Open")
                .order("start_date", { ascending: false })
                .limit(1)
                .maybeSingle()

            if (!period) throw new Error("No open financial period found")

            const entryNumber = initialData?.id 
                ? undefined 
                : await generateEntryNumber()

            // Create journal entry
            const { data: entry, error: entryError } = await supabase
                .from("journal_entries")
                .insert({
                    entry_number: entryNumber,
                    entry_date: data.entry_date,
                    description: data.description,
                    period_id: period.id,
                    status: "Posted",
                    created_by: user.id,
                    posted_at: new Date().toISOString(),
                    posted_by: user.id,
                })
                .select()
                .single()

            if (entryError) throw entryError

            // Create journal entry lines and post to general ledger
            for (let i = 0; i < data.lines.length; i++) {
                const line = data.lines[i]
                
                // Insert journal entry line
                const { error: lineError } = await supabase
                    .from("journal_entry_lines")
                    .insert({
                        journal_entry_id: entry.id,
                        account_id: line.account_id,
                        description: line.description,
                        debit_amount: line.debit_amount || 0,
                        credit_amount: line.credit_amount || 0,
                        line_number: i + 1,
                    })

                if (lineError) throw lineError

                // Post to general ledger
                const { data: account } = await supabase
                    .from("chart_of_accounts")
                    .select("current_balance")
                    .eq("id", line.account_id)
                    .single()

                const currentBalance = account?.current_balance || 0
                const newBalance = currentBalance + (line.debit_amount || 0) - (line.credit_amount || 0)

                const { error: glError } = await supabase
                    .from("general_ledger")
                    .insert({
                        transaction_date: data.entry_date,
                        account_id: line.account_id,
                        reference_type: "Journal",
                        reference_id: entry.id,
                        description: line.description || `Journal Entry: ${entryNumber || entry.id}`,
                        debit_amount: line.debit_amount || 0,
                        credit_amount: line.credit_amount || 0,
                        balance: newBalance,
                        period_id: period.id,
                        created_by: user.id,
                    })

                if (glError) throw glError

                // Update account balance
                await supabase
                    .from("chart_of_accounts")
                    .update({ current_balance: newBalance })
                    .eq("id", line.account_id)
            }

            toast.success("Journal entry posted successfully")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const totalDebit = form.watch("lines").reduce((sum, line) => sum + (line.debit_amount || 0), 0)
    const totalCredit = form.watch("lines").reduce((sum, line) => sum + (line.credit_amount || 0), 0)

    return (
        <FormWrapper<JournalEntryFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Entry" : "Post Entry"}
        >
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="entry_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Entry Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} rows={2} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <FormLabel>Journal Entry Lines</FormLabel>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ account_id: "", description: "", debit_amount: 0, credit_amount: 0 })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Line
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="font-medium">Line {index + 1}</div>
                            {fields.length > 2 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`lines.${index}.account_id`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map((acc) => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.account_code} - {acc.account_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`lines.${index}.description`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name={`lines.${index}.debit_amount`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Debit Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0
                                                    field.onChange(value)
                                                    form.setValue(`lines.${index}.credit_amount`, 0)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`lines.${index}.credit_amount`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credit Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                step="0.01"
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0
                                                    field.onChange(value)
                                                    form.setValue(`lines.${index}.debit_amount`, 0)
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Total Debit</div>
                        <div className="text-lg font-bold text-green-700">
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(totalDebit)}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Credit</div>
                        <div className="text-lg font-bold text-red-700">
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(totalCredit)}
                        </div>
                    </div>
                </div>
                {Math.abs(totalDebit - totalCredit) > 0.01 && (
                    <div className="mt-2 text-sm text-red-600">
                        Debits and credits must be equal. Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}
                    </div>
                )}
            </div>
        </FormWrapper>
    )
}

