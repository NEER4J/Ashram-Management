"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { DonationFormValues, donationSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface DonationFormProps {
    initialData?: Partial<DonationFormValues> & { id?: string }
    onSuccess?: () => void
}

// Define proper type for fetched devotees
type DevoteeOption = {
    id: string
    first_name: string
    last_name: string | null
    mobile_number: string | null
}

export function DonationForm({ initialData, onSuccess }: DonationFormProps) {
    const [loading, setLoading] = useState(false)
    const [devotees, setDevotees] = useState<DevoteeOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Fetch devotees for dropdown
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

    const form = useForm<DonationFormValues>({
        resolver: zodResolver(donationSchema) as any,
        defaultValues: {
            donation_date: initialData?.donation_date ?? new Date().toISOString().split('T')[0],
            payment_mode: initialData?.payment_mode ?? "Cash",
            payment_status: initialData?.payment_status ?? "Completed",
            amount: initialData?.amount ?? 0,
            devotee_id: initialData?.devotee_id ?? "",
            transaction_ref: initialData?.transaction_ref ?? "",
            purpose: initialData?.purpose ?? "",
            category_id: initialData?.category_id ?? undefined,
            receipt_generated: initialData?.receipt_generated ?? false
        }
    })

    const generateDonationCode = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `DON-${year}-`

        // Get the latest donation code for this year
        const { data: latestDonation, error } = await supabase
            .from("donations")
            .select("donation_code")
            .like("donation_code", `${prefix}%`)
            .order("donation_code", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (!error && latestDonation?.donation_code) {
            // Extract the number from the code (e.g., "DON-2024-0123" -> 123)
            const match = latestDonation.donation_code.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        // Format with leading zeros (e.g., 0001, 0002, etc.)
        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: DonationFormValues) {
        setLoading(true)
        try {
            // Convert empty strings to null for optional UUID fields (PostgreSQL requires null, not empty strings)
            const submitData: any = {
                ...data,
            }
            // Handle optional UUID fields - convert empty strings to null
            if (!submitData.category_id || submitData.category_id.trim() === "") {
                submitData.category_id = null
            }

            // Generate donation code only for new donations
            if (!initialData?.id) {
                submitData.donation_code = await generateDonationCode()
            }

            const { error } = initialData?.id
                ? await supabase.from("donations").update(submitData).eq("id", initialData.id)
                : await supabase.from("donations").insert(submitData)

            if (error) throw error

            toast.success(initialData ? "Donation updated" : "Donation recorded")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<DonationFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Donation" : "Record Donation"}
        >
            {initialData?.donation_code && (
                <div className="rounded-md border p-4 bg-slate-50">
                    <div className="text-sm font-medium text-slate-600 mb-1">Donation ID</div>
                    <div className="text-lg font-mono font-semibold text-slate-900">
                        {initialData.donation_code}
                    </div>
                </div>
            )}
            <FormField
                control={form.control}
                name="devotee_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Devotee</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl><Input {...field} type="number" min="0" step="0.01" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="donation_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                                    <SelectItem value="UPI">UPI</SelectItem>
                                    <SelectItem value="Card">Card</SelectItem>
                                    <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                                    <SelectItem value="Cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="payment_status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="transaction_ref"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Transaction Reference / Cheque No</FormLabel>
                        <FormControl><Input {...field} placeholder="Optional for Cash" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Purpose / Remarks</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </FormWrapper>
    )
}
