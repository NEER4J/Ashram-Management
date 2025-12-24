"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { ChartOfAccountFormValues, chartOfAccountSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AccountFormProps {
    initialData?: Partial<ChartOfAccountFormValues> & { id?: string }
    onSuccess?: () => void
}

type AccountOption = {
    id: string
    account_code: string
    account_name: string
    account_type: string
}

export function AccountForm({ initialData, onSuccess }: AccountFormProps) {
    const [loading, setLoading] = useState(false)
    const [parentAccounts, setParentAccounts] = useState<AccountOption[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchParentAccounts = async () => {
            const { data } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name, account_type")
                .eq("is_active", true)
                .order("account_code")
                .returns<AccountOption[]>()

            if (data) setParentAccounts(data)
        }
        fetchParentAccounts()
    }, [supabase])

    const form = useForm<ChartOfAccountFormValues>({
        resolver: zodResolver(chartOfAccountSchema) as any,
        defaultValues: {
            account_code: initialData?.account_code ?? "",
            account_name: initialData?.account_name ?? "",
            account_type: initialData?.account_type ?? "Asset",
            parent_account_id: initialData?.parent_account_id ?? undefined,
            is_gst_applicable: initialData?.is_gst_applicable ?? false,
            gst_rate: initialData?.gst_rate ?? 0,
            opening_balance: initialData?.opening_balance ?? 0,
            description: initialData?.description ?? "",
            is_active: initialData?.is_active ?? true,
        }
    })

    async function onSubmit(data: ChartOfAccountFormValues) {
        setLoading(true)
        try {
            const submitData: any = {
                ...data,
            }
            
            if (!submitData.parent_account_id || submitData.parent_account_id.trim() === "") {
                submitData.parent_account_id = null
            }

            const { error } = initialData?.id
                ? await supabase.from("chart_of_accounts").update(submitData).eq("id", initialData.id)
                : await supabase.from("chart_of_accounts").insert(submitData)

            if (error) throw error

            toast.success(initialData ? "Account updated" : "Account created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<ChartOfAccountFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Account" : "Create Account"}
        >
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="account_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Code</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., 1000" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="account_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl><Input {...field} placeholder="e.g., Cash" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

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
                                <SelectItem value="Asset">Asset</SelectItem>
                                <SelectItem value="Liability">Liability</SelectItem>
                                <SelectItem value="Income">Income</SelectItem>
                                <SelectItem value="Expense">Expense</SelectItem>
                                <SelectItem value="Equity">Equity</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="parent_account_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent Account (Optional)</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value || undefined)} 
                            value={field.value || undefined}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Parent Account" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {parentAccounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.account_code} - {acc.account_name}
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
                    name="opening_balance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Opening Balance (₹)</FormLabel>
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
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
            </div>

            <FormField
                control={form.control}
                name="is_gst_applicable"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>GST Applicable</FormLabel>
                        </div>
                    </FormItem>
                )}
            />

            {form.watch("is_gst_applicable") && (
                <FormField
                    control={form.control}
                    name="gst_rate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>GST Rate (%)</FormLabel>
                            <FormControl><Input {...field} type="number" step="0.01" min="0" max="100" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
