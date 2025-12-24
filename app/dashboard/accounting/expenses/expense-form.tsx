"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { ExpenseFormValues, expenseSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ExpenseFormProps {
    initialData?: Partial<ExpenseFormValues> & { id?: string }
    onSuccess?: () => void
}

type ExpenseCategoryOption = {
    id: string
    account_code: string
    account_name: string
}

type VendorOption = {
    id: string
    name: string
}

type BankAccountOption = {
    id: string
    account_name: string
    bank_name: string
}

export function ExpenseForm({ initialData, onSuccess }: ExpenseFormProps) {
    const [loading, setLoading] = useState(false)
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryOption[]>([])
    const [vendors, setVendors] = useState<VendorOption[]>([])
    const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: categories } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name")
                .eq("account_type", "Expense")
                .eq("is_active", true)
                .order("account_code")
                .returns<ExpenseCategoryOption[]>()

            if (categories) setExpenseCategories(categories)

            const { data: vendorData } = await supabase
                .from("vendors")
                .select("id, name")
                .eq("is_active", true)
                .order("name")
                .returns<VendorOption[]>()

            if (vendorData) setVendors(vendorData)

            const { data: bankData } = await supabase
                .from("bank_accounts")
                .select("id, account_name, bank_name")
                .eq("is_active", true)
                .order("account_name")
                .returns<BankAccountOption[]>()

            if (bankData) setBankAccounts(bankData)
        }
        fetchData()
    }, [supabase])

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema) as any,
        defaultValues: {
            expense_date: initialData?.expense_date ?? new Date().toISOString().split('T')[0],
            expense_category_id: initialData?.expense_category_id ?? "",
            vendor_id: initialData?.vendor_id ?? "",
            amount: initialData?.amount ?? 0,
            gst_rate: initialData?.gst_rate ?? 0,
            description: initialData?.description ?? "",
            payment_status: initialData?.payment_status ?? "Unpaid",
            payment_mode: initialData?.payment_mode ?? undefined,
            bank_account_id: initialData?.bank_account_id ?? "",
            reference_number: initialData?.reference_number ?? "",
        }
    })

    const amount = form.watch("amount") || 0
    const gstRate = form.watch("gst_rate") || 0
    const gstAmount = (amount * gstRate) / 100
    const totalAmount = amount + gstAmount
    const paymentStatus = form.watch("payment_status")

    const generateExpenseNumber = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `EXP-${year}-`

        const { data: latestExpense } = await supabase
            .from("expenses")
            .select("expense_number")
            .like("expense_number", `${prefix}%`)
            .order("expense_number", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (latestExpense?.expense_number) {
            const match = latestExpense.expense_number.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: ExpenseFormValues) {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const { data: period } = await supabase
                .from("financial_periods")
                .select("id")
                .eq("status", "Open")
                .order("start_date", { ascending: false })
                .limit(1)
                .maybeSingle()

            if (!period) throw new Error("No open financial period found")

            const expenseNumber = initialData?.id ? undefined : await generateExpenseNumber()
            const gstAmount = (data.amount * data.gst_rate) / 100
            const totalAmount = data.amount + gstAmount

            const submitData: any = {
                expense_number: expenseNumber,
                expense_date: data.expense_date,
                expense_category_id: data.expense_category_id,
                vendor_id: data.vendor_id || null,
                amount: data.amount,
                gst_rate: data.gst_rate,
                gst_amount: gstAmount,
                total_amount: totalAmount,
                description: data.description,
                payment_status: data.payment_status,
                payment_mode: data.payment_mode || null,
                bank_account_id: data.bank_account_id || null,
                reference_number: data.reference_number || null,
                period_id: period.id,
                created_by: user.id,
            }

            const { data: expense, error } = initialData?.id
                ? await supabase.from("expenses").update(submitData).eq("id", initialData.id).select().single()
                : await supabase.from("expenses").insert(submitData).select().single()

            if (error) throw error

            // Post to general ledger if paid
            if (data.payment_status === "Paid" && expense) {
                const { data: expenseAccount } = await supabase
                    .from("chart_of_accounts")
                    .select("id")
                    .eq("id", data.expense_category_id)
                    .single()

                const bankAccountId = data.bank_account_id || 
                    (await supabase.from("chart_of_accounts").select("id").eq("account_code", "1000").maybeSingle()).data?.id

                if (expenseAccount && bankAccountId) {
                    // Debit Expense
                    const { data: expenseBalance } = await supabase
                        .from("chart_of_accounts")
                        .select("current_balance")
                        .eq("id", expenseAccount.id)
                        .single()

                    const newExpenseBalance = (expenseBalance?.current_balance || 0) + totalAmount

                    await supabase.from("general_ledger").insert({
                        transaction_date: data.expense_date,
                        account_id: expenseAccount.id,
                        reference_type: "Expense",
                        reference_id: expense.id,
                        description: data.description || `Expense: ${expenseNumber || expense.id}`,
                        debit_amount: totalAmount,
                        credit_amount: 0,
                        balance: newExpenseBalance,
                        gst_applicable: data.gst_rate > 0,
                        gst_rate: data.gst_rate,
                        gst_amount: gstAmount,
                        period_id: period.id,
                        created_by: user.id,
                    })

                    await supabase
                        .from("chart_of_accounts")
                        .update({ current_balance: newExpenseBalance })
                        .eq("id", expenseAccount.id)

                    // Credit Bank/Cash
                    const { data: bankBalance } = await supabase
                        .from("chart_of_accounts")
                        .select("current_balance")
                        .eq("id", bankAccountId)
                        .single()

                    const newBankBalance = (bankBalance?.current_balance || 0) - totalAmount

                    await supabase.from("general_ledger").insert({
                        transaction_date: data.expense_date,
                        account_id: bankAccountId,
                        reference_type: "Expense",
                        reference_id: expense.id,
                        description: data.description || `Expense: ${expenseNumber || expense.id}`,
                        debit_amount: 0,
                        credit_amount: totalAmount,
                        balance: newBankBalance,
                        gst_applicable: data.gst_rate > 0,
                        gst_rate: data.gst_rate,
                        gst_amount: gstAmount,
                        period_id: period.id,
                        created_by: user.id,
                    })

                    await supabase
                        .from("chart_of_accounts")
                        .update({ current_balance: newBankBalance })
                        .eq("id", bankAccountId)
                }
            }

            toast.success(initialData ? "Expense updated" : "Expense created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<ExpenseFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Expense" : "Create Expense"}
        >
            <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expense Date *</FormLabel>
                        <FormControl><Input {...field} type="date" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="expense_category_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expense Category *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {expenseCategories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.account_code} - {cat.account_name}
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
                name="vendor_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vendor (Optional)</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value || undefined)} 
                            value={field.value || undefined}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Vendor" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {vendors.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount (₹) *</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value) || 0
                                        field.onChange(value)
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gst_rate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GST Rate (%)</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="rounded-md border p-4 bg-slate-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">GST Amount</div>
                        <div className="font-medium">
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(gstAmount)}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Total Amount</div>
                        <div className="font-bold text-lg">
                            {new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                            }).format(totalAmount)}
                        </div>
                    </div>
                </div>
            </div>

            <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Unpaid">Unpaid</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {paymentStatus === "Paid" && (
                <>
                    <FormField
                        control={form.control}
                        name="payment_mode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Mode</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Mode" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                        <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="Card">Card</SelectItem>
                                        <SelectItem value="DD">DD</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {form.watch("payment_mode") !== "Cash" && (
                        <FormField
                            control={form.control}
                            name="bank_account_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Bank Account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {bankAccounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.account_name} - {acc.bank_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="reference_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reference Number</FormLabel>
                                <FormControl><Input {...field} placeholder="Cheque no, UPI ref, etc." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </>
            )}

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} rows={3} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormWrapper>
    )
}

