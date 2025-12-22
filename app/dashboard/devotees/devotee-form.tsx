"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { DevoteeFormValues, devoteeSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface DevoteeFormProps {
    initialData?: Partial<DevoteeFormValues> & { id?: string }
    onSuccess?: () => void
}

export function DevoteeForm({ initialData, onSuccess }: DevoteeFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<DevoteeFormValues>({
        resolver: zodResolver(devoteeSchema) as any,
        defaultValues: {
            first_name: initialData?.first_name || "",
            middle_name: initialData?.middle_name || "",
            last_name: initialData?.last_name || "",
            email: initialData?.email || "",
            mobile_number: initialData?.mobile_number || "",
            whatsapp_number: initialData?.whatsapp_number || "",
            address_line_1: initialData?.address_line_1 || "",
            gotra: initialData?.gotra || "",
            nakshatra: initialData?.nakshatra || "",
            country: initialData?.country || "India",
            membership_type: initialData?.membership_type || "General",
            membership_status: initialData?.membership_status || "Active",
        }
    })

    async function onSubmit(data: DevoteeFormValues) {
        setLoading(true)
        try {
            const { error } = initialData?.id
                ? await supabase
                    .from("devotees")
                    .update(data)
                    .eq("id", initialData.id)
                : await supabase
                    .from("devotees")
                    .insert(data)

            if (error) throw error

            toast.success(initialData ? "Devotee updated" : "Devotee created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<DevoteeFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Devotee" : "Create Devotee"}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="mobile_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl><Input {...field} type="tel" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="nakshatra"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nakshatra</FormLabel>
                            <FormMessage />
                            {/* Ideally fetch from master_nakshatras */}
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Nakshatra" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Ashwini">Ashwini</SelectItem>
                                    <SelectItem value="Bharani">Bharani</SelectItem>
                                    <SelectItem value="Krittika">Krittika</SelectItem>
                                    <SelectItem value="Rohini">Rohini</SelectItem>
                                    <SelectItem value="Mrigashira">Mrigashira</SelectItem>
                                    <SelectItem value="Ardra">Ardra</SelectItem>
                                    <SelectItem value="Punarvasu">Punarvasu</SelectItem>
                                    <SelectItem value="Pushya">Pushya</SelectItem>
                                    <SelectItem value="Ashlesha">Ashlesha</SelectItem>
                                    <SelectItem value="Magha">Magha</SelectItem>
                                    <SelectItem value="Purva Phalguni">Purva Phalguni</SelectItem>
                                    <SelectItem value="Uttara Phalguni">Uttara Phalguni</SelectItem>
                                    <SelectItem value="Hasta">Hasta</SelectItem>
                                    <SelectItem value="Chitra">Chitra</SelectItem>
                                    <SelectItem value="Swati">Swati</SelectItem>
                                    <SelectItem value="Vishakha">Vishakha</SelectItem>
                                    <SelectItem value="Anuradha">Anuradha</SelectItem>
                                    <SelectItem value="Jyeshtha">Jyeshtha</SelectItem>
                                    <SelectItem value="Mula">Mula</SelectItem>
                                    <SelectItem value="Purva Ashadha">Purva Ashadha</SelectItem>
                                    <SelectItem value="Uttara Ashadha">Uttara Ashadha</SelectItem>
                                    <SelectItem value="Shravana">Shravana</SelectItem>
                                    <SelectItem value="Dhanishta">Dhanishta</SelectItem>
                                    <SelectItem value="Shatabhisha">Shatabhisha</SelectItem>
                                    <SelectItem value="Purva Bhadrapada">Purva Bhadrapada</SelectItem>
                                    <SelectItem value="Uttara Bhadrapada">Uttara Bhadrapada</SelectItem>
                                    <SelectItem value="Revati">Revati</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="gotra"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gotra</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Membership Type field hidden for now */}
            {/* <FormField
                control={form.control}
                name="membership_type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Membership Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Life Member">Life Member</SelectItem>
                                <SelectItem value="Patron">Patron</SelectItem>
                                <SelectItem value="Trustee">Trustee</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            /> */}

        </FormWrapper>
    )
}
