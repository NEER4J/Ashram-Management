"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { BudgetFormValues, budgetSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface BudgetFormProps {
    initialData?: Partial<BudgetFormValues> & { id?: string }
    onSuccess?: () => void
}

type AccountOption = {
    id: string
    account_code: string
    account_name: string
    account_type: string
}

export function BudgetForm({ initialData, onSuccess }: BudgetFormProps) {
    const [loading, setLoading] = useState(false)
    const [accounts, setAccounts] = useState<AccountOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name, account_type")
                .eq("is_active", true)
                .in("account_type", ["Income", "Expense"])
                .order("account_code")
                .returns<AccountOption[]>()

            if (data) setAccounts(data)
        }
        fetchAccounts()
    }, [supabase])

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema) as any,
        defaultValues: {
            financial_year: initialData?.financial_year ?? `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
            account_id: initialData?.account_id ?? "",
            budgeted_amount: initialData?.budgeted_amount ?? 0,
        }
    })

    async function onSubmit(data: BudgetFormValues) {
        setLoading(true)
        try {
            // Calculate actual amount from general ledger
            const startDate = `${data.financial_year.split('-')[0]}-04-01`
            const endDate = `${data.financial_year.split('-')[1]}-03-31`
            
            let actualAmount = 0
            if (initialData?.id) {
                // For updates, recalculate actual
                const { data: account } = await supabase
                    .from("chart_of_accounts")
                    .select("account_type")
                    .eq("id", data.account_id)
                    .single()

                if (account) {
                    const { data: ledgerEntries } = await supabase
                        .from("general_ledger")
                        .select("debit_amount, credit_amount")
                        .eq("account_id", data.account_id)
                        .gte("transaction_date", startDate)
                        .lte("transaction_date", endDate)

                    if (ledgerEntries) {
                        if (account.account_type === "Income") {
                            actualAmount = ledgerEntries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)
                        } else if (account.account_type === "Expense") {
                            actualAmount = ledgerEntries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
                        }
                    }
                }
            }

            const submitData: any = {
                financial_year: data.financial_year,
                account_id: data.account_id,
                budgeted_amount: data.budgeted_amount,
                actual_amount: actualAmount,
            }

            const { error } = initialData?.id
                ? await supabase.from("budgets").update(submitData).eq("id", initialData.id)
                : await supabase.from("budgets").upsert(submitData, {
                    onConflict: "financial_year,account_id"
                })

            if (error) throw error

            toast.success(initialData ? "Budget updated" : "Budget created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<BudgetFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Budget" : "Create Budget"}
        >
            <FormField
                control={form.control}
                name="financial_year"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Financial Year *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., 2024-25" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Account *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.account_code} - {acc.account_name} ({acc.account_type})
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
                name="budgeted_amount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Budgeted Amount (₹) *</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormWrapper>
    )
}

