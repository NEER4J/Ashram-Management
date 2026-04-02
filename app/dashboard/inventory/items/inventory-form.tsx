"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { InventoryItemFormValues, inventoryItemSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface InventoryFormProps {
    initialData?: Partial<InventoryItemFormValues> & { id?: string }
    onSuccess?: () => void
}

export function InventoryForm({ initialData, onSuccess }: InventoryFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<InventoryItemFormValues>({
        resolver: zodResolver(inventoryItemSchema) as any,
        defaultValues: {
            unit: initialData?.unit || "PCS",
            current_stock: initialData?.current_stock || 0,
            min_stock_level: initialData?.min_stock_level || 0,
            name: initialData?.name || "",
            category: initialData?.category || "",
            is_perishable: initialData?.is_perishable || false,
        }
    })

    async function onSubmit(data: InventoryItemFormValues) {
        setLoading(true)
        try {
            const { error } = initialData?.id
                ? await supabase.from("inventory_items").update(data).eq("id", initialData.id)
                : await supabase.from("inventory_items").insert(data)

            if (error) throw error

            toast.success(initialData ? "Item updated" : "Item created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<InventoryItemFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Item" : "Add Item"}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Puja Material">Puja Material</SelectItem>
                                    <SelectItem value="Prasad">Prasad</SelectItem>
                                    <SelectItem value="Decoration">Decoration</SelectItem>
                                    <SelectItem value="Utensils">Utensils</SelectItem>
                                    <SelectItem value="Books">Books</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>UOM</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                                    <SelectItem value="KG">Kilogram (KG)</SelectItem>
                                    <SelectItem value="LTR">Liter (LTR)</SelectItem>
                                    <SelectItem value="BOX">Box</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="current_stock"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Stock</FormLabel>
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="min_stock_level"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reorder Level</FormLabel>
                            <FormControl><Input {...field} type="number" step="0.01" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="is_perishable"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Perishable Item?
                            </FormLabel>
                        </div>
                    </FormItem>
                )}
            />

        </FormWrapper>
    )
}
