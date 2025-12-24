"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { InvoiceFormValues, invoiceSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface InvoiceFormProps {
    initialData?: Partial<InvoiceFormValues> & { id?: string }
    onSuccess?: () => void
}

type DevoteeOption = {
    id: string
    first_name: string
    last_name: string | null
    mobile_number: string | null
}

export function InvoiceForm({ initialData, onSuccess }: InvoiceFormProps) {
    const [loading, setLoading] = useState(false)
    const [devotees, setDevotees] = useState<DevoteeOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchDevotees = async () => {
            const { data } = await supabase
                .from("devotees")
                .select("id, first_name, last_name, mobile_number")
                .limit(100)
                .returns<DevoteeOption[]>()

            if (data) setDevotees(data)
        }
        fetchDevotees()
    }, [supabase])

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema) as any,
        defaultValues: {
            devotee_id: initialData?.devotee_id ?? "",
            invoice_date: initialData?.invoice_date ?? new Date().toISOString().split('T')[0],
            due_date: initialData?.due_date ?? "",
            subtotal: initialData?.subtotal ?? 0,
            gst_rate: initialData?.gst_rate ?? 0,
            description: initialData?.description ?? "",
        }
    })

    const subtotal = form.watch("subtotal") || 0
    const gstRate = form.watch("gst_rate") || 0
    const gstAmount = (subtotal * gstRate) / 100
    const totalAmount = subtotal + gstAmount

    const generateInvoiceNumber = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `INV-${year}-`

        const { data: latestInvoice } = await supabase
            .from("invoices")
            .select("invoice_number")
            .like("invoice_number", `${prefix}%`)
            .order("invoice_number", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (latestInvoice?.invoice_number) {
            const match = latestInvoice.invoice_number.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: InvoiceFormValues) {
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

            const invoiceNumber = initialData?.id ? undefined : await generateInvoiceNumber()
            const gstAmount = (data.subtotal * data.gst_rate) / 100
            const totalAmount = data.subtotal + gstAmount

            const submitData: any = {
                invoice_number: invoiceNumber,
                devotee_id: data.devotee_id || null,
                invoice_date: data.invoice_date,
                due_date: data.due_date || null,
                subtotal: data.subtotal,
                gst_rate: data.gst_rate,
                gst_amount: gstAmount,
                total_amount: totalAmount,
                description: data.description,
                payment_status: "Unpaid",
                paid_amount: 0,
                period_id: period.id,
                created_by: user.id,
            }

            const { data: invoice, error } = initialData?.id
                ? await supabase.from("invoices").update(submitData).eq("id", initialData.id).select().single()
                : await supabase.from("invoices").insert(submitData).select().single()

            if (error) throw error

            // Post to general ledger - Debit Accounts Receivable, Credit Income
            const { data: arAccount } = await supabase
                .from("chart_of_accounts")
                .select("id")
                .eq("account_code", "1200")
                .maybeSingle()

            const { data: incomeAccount } = await supabase
                .from("chart_of_accounts")
                .select("id")
                .eq("account_code", "4300")
                .maybeSingle()

            if (arAccount && incomeAccount && invoice) {
                // Debit Accounts Receivable
                const { data: arBalance } = await supabase
                    .from("chart_of_accounts")
                    .select("current_balance")
                    .eq("id", arAccount.id)
                    .single()

                const newArBalance = (arBalance?.current_balance || 0) + totalAmount

                await supabase.from("general_ledger").insert({
                    transaction_date: data.invoice_date,
                    account_id: arAccount.id,
                    reference_type: "Invoice",
                    reference_id: invoice.id,
                    description: `Invoice: ${invoiceNumber || invoice.id}`,
                    debit_amount: totalAmount,
                    credit_amount: 0,
                    balance: newArBalance,
                    gst_applicable: data.gst_rate > 0,
                    gst_rate: data.gst_rate,
                    gst_amount: gstAmount,
                    period_id: period.id,
                    created_by: user.id,
                })

                await supabase
                    .from("chart_of_accounts")
                    .update({ current_balance: newArBalance })
                    .eq("id", arAccount.id)

                // Credit Income
                const { data: incomeBalance } = await supabase
                    .from("chart_of_accounts")
                    .select("current_balance")
                    .eq("id", incomeAccount.id)
                    .single()

                const newIncomeBalance = (incomeBalance?.current_balance || 0) + totalAmount

                await supabase.from("general_ledger").insert({
                    transaction_date: data.invoice_date,
                    account_id: incomeAccount.id,
                    reference_type: "Invoice",
                    reference_id: invoice.id,
                    description: `Invoice: ${invoiceNumber || invoice.id}`,
                    debit_amount: 0,
                    credit_amount: totalAmount,
                    balance: newIncomeBalance,
                    gst_applicable: data.gst_rate > 0,
                    gst_rate: data.gst_rate,
                    gst_amount: gstAmount,
                    period_id: period.id,
                    created_by: user.id,
                })

                await supabase
                    .from("chart_of_accounts")
                    .update({ current_balance: newIncomeBalance })
                    .eq("id", incomeAccount.id)
            }

            toast.success(initialData ? "Invoice updated" : "Invoice created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<InvoiceFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Invoice" : "Create Invoice"}
        >
            <FormField
                control={form.control}
                name="devotee_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Devotee (Optional)</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value || undefined)} 
                            value={field.value || undefined}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Devotee" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {devotees.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>
                                        {d.first_name} {d.last_name} ({d.mobile_number})
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
                    name="invoice_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Invoice Date *</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subtotal (₹) *</FormLabel>
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

