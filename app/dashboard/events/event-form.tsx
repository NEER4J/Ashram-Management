"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { EventFormValues, eventSchema, generateSlug } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { INDIAN_STATES, CITIES_BY_STATE } from "@/lib/data/indian-states-cities"

interface EventFormProps {
    initialData?: Partial<EventFormValues> & { id?: string; slug?: string; is_published?: boolean; city?: string; state?: string }
    onSuccess?: () => void
}

export function EventForm({ initialData, onSuccess }: EventFormProps) {
    const [loading, setLoading] = useState(false)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema) as any,
        defaultValues: {
            status: initialData?.status || "Planned",
            name: initialData?.name || "",
            slug: initialData?.slug || (initialData?.name ? generateSlug(initialData.name) : ""),
            type: initialData?.type || "",
            start_date: initialData?.start_date || "",
            end_date: initialData?.end_date || "",
            city: initialData?.city || "",
            state: initialData?.state || "",
            description: initialData?.description || "",
            is_published: initialData?.is_published ?? false,
        }
    })

    const eventName = form.watch("name")
    const currentSlug = form.watch("slug")

    // Auto-generate slug from name when name changes (unless manually edited)
    useEffect(() => {
        if (eventName && !slugManuallyEdited && (!currentSlug || !initialData?.slug)) {
            const generatedSlug = generateSlug(eventName)
            form.setValue("slug", generatedSlug)
        }
    }, [eventName, slugManuallyEdited, currentSlug, form, initialData?.slug])

    async function onSubmit(data: EventFormValues) {
        setLoading(true)
        try {
            // Check slug uniqueness (only for new events or if slug changed)
            if (!initialData?.id || data.slug !== initialData.slug) {
                const { data: existing, error: checkError } = await supabase
                    .from("temple_events")
                    .select("id")
                    .eq("slug", data.slug)
                    .maybeSingle()

                if (checkError) throw checkError

                if (existing && existing.id !== initialData?.id) {
                    toast.error("This slug is already taken. Please use a different slug.")
                    setLoading(false)
                    return
                }
            }

            const { error } = initialData?.id
                ? await supabase.from("temple_events").update(data).eq("id", initialData.id)
                : await supabase.from("temple_events").insert(data)

            if (error) throw error

            toast.success(initialData ? "Event updated" : "Event created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<EventFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Event" : "Create Event"}
        >
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                            <Input 
                                {...field} 
                                onChange={(e) => {
                                    field.onChange(e)
                                    setSlugManuallyEdited(true)
                                }}
                                placeholder="event-slug-2025"
                            />
                        </FormControl>
                        <FormDescription>
                            URL-friendly identifier (auto-generated from name, but you can edit it)
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Festival">Festival</SelectItem>
                                    <SelectItem value="Cultural">Cultural</SelectItem>
                                    <SelectItem value="Educational">Educational</SelectItem>
                                    <SelectItem value="Charity">Charity</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Planned">Planned</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl><Input {...field} type="date" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value)
                                form.setValue("city", "") // Reset city when state changes
                            }} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {INDIAN_STATES.map((state) => (
                                        <SelectItem key={state.code} value={state.name}>
                                            {state.name}
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
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch("state")}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={form.watch("state") ? "Select City" : "Select State first"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {form.watch("state") && CITIES_BY_STATE[form.watch("state")]?.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea {...field} rows={4} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="is_published"
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
                                Publish Event
                            </FormLabel>
                            <FormDescription>
                                Published events will be visible on the public events page and can accept registrations.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />

        </FormWrapper>
    )
}
