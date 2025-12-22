"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { PujaBookingFormValues, pujaBookingSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface PujaBookingFormProps {
    initialData?: Partial<PujaBookingFormValues> & { id?: string }
    onSuccess?: () => void
}

// Define proper types for fetched data
type DevoteeOption = {
    id: string
    first_name: string
    last_name: string | null
    mobile_number: string | null
}

type PujaOption = {
    id: string
    name: string
    base_amount: number
}

export function PujaBookingForm({ initialData, onSuccess }: PujaBookingFormProps) {
    const [loading, setLoading] = useState(false)
    const [devotees, setDevotees] = useState<DevoteeOption[]>([])
    const [pujas, setPujas] = useState<PujaOption[]>([])
    // const [priests, setPriests] = useState<any[]>([]) // Add staff later
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchMasterData = async () => {
            const { data: dData } = await supabase
                .from("devotees")
                .select("id, first_name, last_name, mobile_number")
                .limit(100)
                .returns<DevoteeOption[]>()

            if (dData) setDevotees(dData)

            const { data: pData } = await supabase
                .from("master_pujas")
                .select("id, name, base_amount")
                .returns<PujaOption[]>()

            if (pData) setPujas(pData)
        }
        fetchMasterData()
    }, [supabase])

    const form = useForm<PujaBookingFormValues>({
        resolver: zodResolver(pujaBookingSchema) as any,
        defaultValues: {
            booking_date: initialData?.booking_date || new Date().toISOString().split('T')[0],
            status: initialData?.status || "Confirmed",
            payment_status: initialData?.payment_status || "Pending",
            amount_paid: initialData?.amount_paid || 0,
            puja_time: initialData?.puja_time || "",
            devotee_id: initialData?.devotee_id || "",
            puja_id: initialData?.puja_id || "",
        }
    })

    // Auto-fill amount when puja is selected
    const watchPuja = form.watch("puja_id")
    useEffect(() => {
        if (watchPuja) {
            const selectedPuja = pujas.find(p => p.id === watchPuja)
            if (selectedPuja && !initialData) {
                form.setValue("amount_paid", selectedPuja.base_amount)
            }
        }
    }, [watchPuja, pujas, initialData, form])

    async function onSubmit(data: PujaBookingFormValues) {
        setLoading(true)
        try {
            const { error } = initialData?.id
                ? await supabase.from("puja_bookings").update(data).eq("id", initialData.id)
                : await supabase.from("puja_bookings").insert(data)

            if (error) throw error

            toast.success(initialData ? "Booking updated" : "Booking confirmed")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<PujaBookingFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Booking" : "Confirm Booking"}
        >
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

            <FormField
                control={form.control}
                name="puja_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Puja / Seva</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Puja" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {pujas.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} (₹{p.base_amount})
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
                    name="puja_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="puja_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time</FormLabel>
                            <FormControl><Input {...field} type="time" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Booking Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                            <FormLabel>Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Payment" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="amount_paid"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Amount Paid (₹)</FormLabel>
                        <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

        </FormWrapper>
    )
}
