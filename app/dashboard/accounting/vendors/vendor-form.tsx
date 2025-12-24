"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { VendorFormValues, vendorSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface VendorFormProps {
    initialData?: Partial<VendorFormValues> & { id?: string }
    onSuccess?: () => void
}

export function VendorForm({ initialData, onSuccess }: VendorFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(vendorSchema) as any,
        defaultValues: {
            vendor_code: initialData?.vendor_code ?? "",
            name: initialData?.name ?? "",
            gstin: initialData?.gstin ?? "",
            contact_person: initialData?.contact_person ?? "",
            email: initialData?.email ?? "",
            phone: initialData?.phone ?? "",
            address_line_1: initialData?.address_line_1 ?? "",
            address_line_2: initialData?.address_line_2 ?? "",
            city: initialData?.city ?? "",
            state: initialData?.state ?? "",
            pincode: initialData?.pincode ?? "",
            country: initialData?.country ?? "India",
            payment_terms: initialData?.payment_terms ?? "",
            is_active: initialData?.is_active ?? true,
        }
    })

    const generateVendorCode = async (): Promise<string> => {
        const year = new Date().getFullYear()
        const prefix = `VND-${year}-`

        const { data: latestVendor } = await supabase
            .from("vendors")
            .select("vendor_code")
            .like("vendor_code", `${prefix}%`)
            .order("vendor_code", { ascending: false })
            .limit(1)
            .maybeSingle()

        let nextNumber = 1
        if (latestVendor?.vendor_code) {
            const match = latestVendor.vendor_code.match(/-(\d+)$/)
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, "0")}`
    }

    async function onSubmit(data: VendorFormValues) {
        setLoading(true)
        try {
            const submitData: any = {
                ...data,
            }

            if (!initialData?.id && !submitData.vendor_code) {
                submitData.vendor_code = await generateVendorCode()
            }

            if (!submitData.email || submitData.email.trim() === "") {
                submitData.email = null
            }

            const { error } = initialData?.id
                ? await supabase.from("vendors").update(submitData).eq("id", initialData.id)
                : await supabase.from("vendors").insert(submitData)

            if (error) throw error

            toast.success(initialData ? "Vendor updated" : "Vendor created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<VendorFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Vendor" : "Create Vendor"}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vendor Name *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="gstin"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GSTIN</FormLabel>
                            <FormControl><Input {...field} placeholder="29ABCDE1234F1Z5" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Person</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input {...field} type="email" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address Line 1</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="address_line_2"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Address Line 2</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Terms</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., Net 30" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
        </FormWrapper>
    )
}

