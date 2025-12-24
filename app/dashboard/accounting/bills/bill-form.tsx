"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { BillFormValues, billSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface BillFormProps {
    initialData?: Partial<BillFormValues> & { id?: string }
    onSuccess?: () => void
}

type VendorOption = {
    id: string
    name: string
    gstin: string | null
}

export function BillForm({ initialData, onSuccess }: BillFormProps) {
    const [loading, setLoading] = useState(false)
    const [vendors, setVendors] = useState<VendorOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchVendors = async () => {
            const { data } = await supabase
                .from("vendors")
                .select("id, name, gstin")
                .eq("is_active", true)
                .order("name")
                .returns<VendorOption[]>()

            if (data) setVendors(data)
        }
        fetchVendors()
    }, [supabase])

    const form = useForm<BillFormValues>({
        resolver: zodResolver(billSchema) as any,
        defaultValues: {
            vendor_id: initialData?.vendor_id ?? "",
            bill_date: initialData?.bill_date ?? new Date().toISOString().split('T')[0],
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

    const generateBillNumber = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `BILL-${year}-`

        const { data: latestBill } = await supabase
            .from("bills")
            .select("bill_number")
            .like("bill_number", `${prefix}%`)
            .order("bill_number", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (latestBill?.bill_number) {
            const match = latestBill.bill_number.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: BillFormValues) {
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

            const billNumber = initialData?.id ? undefined : await generateBillNumber()
            const gstAmount = (data.subtotal * data.gst_rate) / 100
            const totalAmount = data.subtotal + gstAmount

            const submitData: any = {
                bill_number: billNumber,
                vendor_id: data.vendor_id,
                bill_date: data.bill_date,
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

            const { data: bill, error } = initialData?.id
                ? await supabase.from("bills").update(submitData).eq("id", initialData.id).select().single()
                : await supabase.from("bills").insert(submitData).select().single()

            if (error) throw error

            // Post to general ledger - Debit Expense/Asset, Credit Accounts Payable
            const { data: apAccount } = await supabase
                .from("chart_of_accounts")
                .select("id")
                .eq("account_code", "2000")
                .maybeSingle()

            const { data: expenseAccount } = await supabase
                .from("chart_of_accounts")
                .select("id")
                .eq("account_code", "5200")
                .maybeSingle()

            if (apAccount && expenseAccount && bill) {
                // Debit Expense
                const { data: expenseBalance } = await supabase
                    .from("chart_of_accounts")
                    .select("current_balance")
                    .eq("id", expenseAccount.id)
                    .single()

                const newExpenseBalance = (expenseBalance?.current_balance || 0) + totalAmount

                await supabase.from("general_ledger").insert({
                    transaction_date: data.bill_date,
                    account_id: expenseAccount.id,
                    reference_type: "Bill",
                    reference_id: bill.id,
                    description: `Bill from vendor: ${billNumber || bill.id}`,
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

                // Credit Accounts Payable
                const { data: apBalance } = await supabase
                    .from("chart_of_accounts")
                    .select("current_balance")
                    .eq("id", apAccount.id)
                    .single()

                const newApBalance = (apBalance?.current_balance || 0) - totalAmount

                await supabase.from("general_ledger").insert({
                    transaction_date: data.bill_date,
                    account_id: apAccount.id,
                    reference_type: "Bill",
                    reference_id: bill.id,
                    description: `Bill from vendor: ${billNumber || bill.id}`,
                    debit_amount: 0,
                    credit_amount: totalAmount,
                    balance: newApBalance,
                    gst_applicable: data.gst_rate > 0,
                    gst_rate: data.gst_rate,
                    gst_amount: gstAmount,
                    period_id: period.id,
                    created_by: user.id,
                })

                await supabase
                    .from("chart_of_accounts")
                    .update({ current_balance: newApBalance })
                    .eq("id", apAccount.id)
            }

            toast.success(initialData ? "Bill updated" : "Bill created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<BillFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Bill" : "Create Bill"}
        >
            <FormField
                control={form.control}
                name="vendor_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vendor *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Vendor" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {vendors.map((v) => (
                                    <SelectItem key={v.id} value={v.id}>
                                        {v.name} {v.gstin ? `(${v.gstin})` : ""}
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
                    name="bill_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bill Date *</FormLabel>
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

