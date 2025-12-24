"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

const gstReturnSchema = z.object({
    return_period: z.string().min(1, "Return period is required"),
    return_type: z.enum(["GSTR-1", "GSTR-3B", "GSTR-9"]),
    filing_date: z.string().optional(),
    taxable_value: z.coerce.number().min(0).optional().default(0),
    cgst_amount: z.coerce.number().min(0).optional().default(0),
    sgst_amount: z.coerce.number().min(0).optional().default(0),
    igst_amount: z.coerce.number().min(0).optional().default(0),
    remarks: z.string().optional(),
})

type GSTReturnFormValues = z.infer<typeof gstReturnSchema>

interface GSTReturnFormProps {
    onSuccess?: () => void
}

export function GSTReturnForm({ onSuccess }: GSTReturnFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<GSTReturnFormValues>({
        resolver: zodResolver(gstReturnSchema) as any,
        defaultValues: {
            return_period: "",
            return_type: "GSTR-3B",
            filing_date: "",
            taxable_value: 0,
            cgst_amount: 0,
            sgst_amount: 0,
            igst_amount: 0,
            remarks: "",
        }
    })

    async function onSubmit(data: GSTReturnFormValues) {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("User not authenticated")

            const totalTax = data.cgst_amount + data.sgst_amount + data.igst_amount

            const submitData: any = {
                return_period: data.return_period,
                return_type: data.return_type,
                filing_date: data.filing_date || null,
                taxable_value: data.taxable_value,
                cgst_amount: data.cgst_amount,
                sgst_amount: data.sgst_amount,
                igst_amount: data.igst_amount,
                total_tax_amount: totalTax,
                status: data.filing_date ? "Filed" : "Draft",
                remarks: data.remarks || null,
                created_by: user.id,
            }

            const { error } = await supabase.from("gst_returns").upsert(submitData, {
                onConflict: "return_period,return_type"
            })

            if (error) throw error

            toast.success("GST return recorded successfully")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const totalTax = (form.watch("cgst_amount") || 0) + (form.watch("sgst_amount") || 0) + (form.watch("igst_amount") || 0)

    return (
        <FormWrapper<GSTReturnFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel="Save GST Return"
        >
            <FormField
                control={form.control}
                name="return_period"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Return Period *</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., 2024-04" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="return_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Return Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="GSTR-1">GSTR-1</SelectItem>
                                <SelectItem value="GSTR-3B">GSTR-3B</SelectItem>
                                <SelectItem value="GSTR-9">GSTR-9</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="filing_date"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Filing Date</FormLabel>
                        <FormControl><Input {...field} type="date" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="taxable_value"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Taxable Value (₹)</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="cgst_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CGST (₹)</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sgst_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SGST (₹)</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="igst_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>IGST (₹)</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="rounded-md border p-4 bg-slate-50">
                <div className="text-sm">
                    <div className="text-muted-foreground">Total Tax Amount</div>
                    <div className="font-bold text-lg">
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(totalTax)}
                    </div>
                </div>
            </div>

            <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl><Textarea {...field} rows={3} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </FormWrapper>
    )
}

