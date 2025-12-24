"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { InvoicePaymentFormValues, invoicePaymentSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface InvoicePaymentFormProps {
    invoiceId: string
    invoiceAmount: number
    paidAmount: number
    onSuccess?: () => void
}

type BankAccountOption = {
    id: string
    account_name: string
    bank_name: string
}

export function InvoicePaymentForm({ invoiceId, invoiceAmount, paidAmount, onSuccess }: InvoicePaymentFormProps) {
    const [loading, setLoading] = useState(false)
    const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchBankAccounts = async () => {
            const { data } = await supabase
                .from("bank_accounts")
                .select("id, account_name, bank_name")
                .eq("is_active", true)
                .order("account_name")
                .returns<BankAccountOption[]>()

            if (data) setBankAccounts(data)
        }
        fetchBankAccounts()
    }, [supabase])

    const form = useForm<InvoicePaymentFormValues>({
        resolver: zodResolver(invoicePaymentSchema) as any,
        defaultValues: {
            invoice_id: invoiceId,
            payment_date: new Date().toISOString().split('T')[0],
            amount: invoiceAmount - paidAmount,
            payment_mode: "Online Transfer",
            bank_account_id: "",
            reference_number: "",
            description: "",
        }
    })

    async function onSubmit(data: InvoicePaymentFormValues) {
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

            // Create payment record
            const { data: payment, error: paymentError } = await supabase
                .from("invoice_payments")
                .insert({
                    invoice_id: data.invoice_id,
                    payment_date: data.payment_date,
                    amount: data.amount,
                    payment_mode: data.payment_mode,
                    bank_account_id: data.bank_account_id || null,
                    reference_number: data.reference_number || null,
                    description: data.description || null,
                    created_by: user.id,
                })
                .select()
                .single()

            if (paymentError) throw paymentError

            // Update invoice payment status
            const { data: invoice } = await supabase
                .from("invoices")
                .select("total_amount, paid_amount")
                .eq("id", invoiceId)
                .single()

            if (invoice) {
                const newPaidAmount = (invoice.paid_amount || 0) + data.amount
                const paymentStatus = newPaidAmount >= invoice.total_amount ? "Paid" : 
                                    newPaidAmount > 0 ? "Partial" : "Unpaid"

                await supabase
                    .from("invoices")
                    .update({
                        paid_amount: newPaidAmount,
                        payment_status: paymentStatus,
                    })
                    .eq("id", invoiceId)

                // Post to general ledger
                const { data: arAccount } = await supabase
                    .from("chart_of_accounts")
                    .select("id")
                    .eq("account_code", "1200")
                    .maybeSingle()

                const bankAccountId = data.bank_account_id || 
                    (await supabase.from("chart_of_accounts").select("id").eq("account_code", "1000").maybeSingle()).data?.id

                if (arAccount && bankAccountId) {
                    // Credit Accounts Receivable
                    const { data: arBalance } = await supabase
                        .from("chart_of_accounts")
                        .select("current_balance")
                        .eq("id", arAccount.id)
                        .single()

                    const newArBalance = (arBalance?.current_balance || 0) - data.amount

                    await supabase.from("general_ledger").insert({
                        transaction_date: data.payment_date,
                        account_id: arAccount.id,
                        reference_type: "Invoice Payment",
                        reference_id: payment.id,
                        description: `Payment for invoice ${invoiceId}`,
                        debit_amount: 0,
                        credit_amount: data.amount,
                        balance: newArBalance,
                        period_id: period.id,
                        created_by: user.id,
                    })

                    await supabase
                        .from("chart_of_accounts")
                        .update({ current_balance: newArBalance })
                        .eq("id", arAccount.id)

                    // Debit Bank/Cash
                    const { data: bankBalance } = await supabase
                        .from("chart_of_accounts")
                        .select("current_balance")
                        .eq("id", bankAccountId)
                        .single()

                    const newBankBalance = (bankBalance?.current_balance || 0) + data.amount

                    await supabase.from("general_ledger").insert({
                        transaction_date: data.payment_date,
                        account_id: bankAccountId,
                        reference_type: "Invoice Payment",
                        reference_id: payment.id,
                        description: `Payment for invoice ${invoiceId}`,
                        debit_amount: data.amount,
                        credit_amount: 0,
                        balance: newBankBalance,
                        period_id: period.id,
                        created_by: user.id,
                    })

                    await supabase
                        .from("chart_of_accounts")
                        .update({ current_balance: newBankBalance })
                        .eq("id", bankAccountId)
                }
            }

            toast.success("Payment recorded successfully")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const remainingAmount = invoiceAmount - paidAmount

    return (
        <FormWrapper<InvoicePaymentFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel="Record Payment"
        >
            <div className="rounded-md border p-4 bg-slate-50">
                <div className="text-sm">
                    <div className="text-muted-foreground">Invoice Amount</div>
                    <div className="font-medium text-lg">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(invoiceAmount)}
                    </div>
                    <div className="text-muted-foreground mt-2">Paid Amount</div>
                    <div className="font-medium">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(paidAmount)}
                    </div>
                    <div className="text-muted-foreground mt-2">Remaining Amount</div>
                    <div className="font-bold text-lg text-red-600">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(remainingAmount)}
                    </div>
                </div>
            </div>

            <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Date *</FormLabel>
                        <FormControl><Input {...field} type="date" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Amount (₹) *</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type="number"
                                step="0.01"
                                max={remainingAmount}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0
                                    field.onChange(Math.min(value, remainingAmount))
                                }}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="payment_mode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Mode *</FormLabel>
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
        </FormWrapper>
    )
}

