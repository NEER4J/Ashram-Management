"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { BankAccountFormValues, bankAccountSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface BankAccountFormProps {
    initialData?: Partial<BankAccountFormValues> & { id?: string }
    onSuccess?: () => void
}

export function BankAccountForm({ initialData, onSuccess }: BankAccountFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<BankAccountFormValues>({
        resolver: zodResolver(bankAccountSchema) as any,
        defaultValues: {
            account_name: initialData?.account_name ?? "",
            account_number: initialData?.account_number ?? "",
            bank_name: initialData?.bank_name ?? "",
            ifsc_code: initialData?.ifsc_code ?? "",
            branch: initialData?.branch ?? "",
            account_type: initialData?.account_type ?? "Savings",
            opening_balance: initialData?.opening_balance ?? 0,
            is_active: initialData?.is_active ?? true,
        }
    })

    async function onSubmit(data: BankAccountFormValues) {
        setLoading(true)
        try {
            const submitData: any = {
                ...data,
                current_balance: initialData?.opening_balance ?? data.opening_balance,
            }

            const { error } = initialData?.id
                ? await supabase.from("bank_accounts").update(submitData).eq("id", initialData.id)
                : await supabase.from("bank_accounts").insert(submitData)

            if (error) throw error

            toast.success(initialData ? "Bank account updated" : "Bank account created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<BankAccountFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Account" : "Create Account"}
        >
            <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., Main Operating Account" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., State Bank of India" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="ifsc_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>IFSC Code</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., SBIN0001234" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Branch</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Savings">Savings</SelectItem>
                                    <SelectItem value="Current">Current</SelectItem>
                                    <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="opening_balance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Opening Balance (₹)</FormLabel>
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

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

