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
import Image from "next/image"
import { Loader2, X } from "lucide-react"

interface EventFormProps {
    initialData?: Partial<EventFormValues> & { 
        id?: string
        slug?: string
        is_published?: boolean
        is_active?: boolean
        city?: string
        state?: string
        hero_image_url?: string
        subtitle?: string
        facebook_url?: string
        instagram_url?: string
        youtube_url?: string
        whatsapp_number?: string
        whatsapp_message?: string
        contact_phone?: string
    }
    onSuccess?: () => void
}

export function EventForm({ initialData, onSuccess }: EventFormProps) {
    const [loading, setLoading] = useState(false)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [venues, setVenues] = useState<{ id: string; name: string }[]>([])
    const [staff, setStaff] = useState<{ id: string; first_name: string; last_name: string | null }[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.from("venues").select("id, name").eq("is_active", true).then(({ data }) => setVenues(data || []))
        supabase.from("staff").select("id, first_name, last_name").eq("is_active", true).then(({ data }) => setStaff(data || []))
    }, [supabase])

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
            is_active: initialData?.is_active ?? true,
            hero_image_url: initialData?.hero_image_url || "",
            subtitle: initialData?.subtitle || "",
            facebook_url: initialData?.facebook_url || "",
            instagram_url: initialData?.instagram_url || "",
            youtube_url: initialData?.youtube_url || "",
            whatsapp_number: initialData?.whatsapp_number || "",
            whatsapp_message: initialData?.whatsapp_message || "",
            contact_phone: initialData?.contact_phone || "",
            venue_id: initialData?.venue_id || "",
            capacity: (initialData as { capacity?: number })?.capacity ?? undefined,
            recurrence_rule: (initialData as { recurrence_rule?: string })?.recurrence_rule || "",
            recurrence_end_date: (initialData as { recurrence_end_date?: string })?.recurrence_end_date || "",
            speaker_facilitator_id: (initialData as { speaker_facilitator_id?: string })?.speaker_facilitator_id || "",
            stream_url: (initialData as { stream_url?: string })?.stream_url || "",
            stream_embed: (initialData as { stream_embed?: string })?.stream_embed || "",
            budget: (initialData as { budget?: number })?.budget ?? undefined,
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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file")
            return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image size should be less than 10MB")
            return
        }

        setUploadingImage(true)
        try {
            const fileExt = file.name.split('.').pop()
            const slug = form.getValues("slug") || "event"
            const fileName = `${slug}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `heroes/${fileName}`

            // Delete old image if editing and replacing
            const currentImageUrl = form.getValues("hero_image_url")
            if (currentImageUrl && initialData?.id && currentImageUrl.includes('event-images')) {
                try {
                    // Extract the path from the full URL
                    const urlParts = currentImageUrl.split('/')
                    const bucketIndex = urlParts.findIndex(part => part === 'event-images')
                    if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
                        const oldPath = urlParts.slice(bucketIndex + 1).join('/')
                        await supabase.storage
                            .from('event-images')
                            .remove([oldPath])
                    }
                } catch (error) {
                    // Ignore errors when deleting old image
                    console.log("Could not delete old image:", error)
                }
            }

            const { error: uploadError } = await supabase.storage
                .from('event-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
                    throw new Error('Storage bucket "event-images" not found. Please create it in Supabase Storage settings.')
                }
                throw uploadError
            }

            const { data } = supabase.storage
                .from('event-images')
                .getPublicUrl(filePath)

            form.setValue("hero_image_url", data.publicUrl)
            toast.success("Hero image uploaded successfully")
        } catch (error: any) {
            console.error("Error uploading image:", error)
            const errorMessage = error?.message || "Failed to upload image"
            toast.error(errorMessage)
        } finally {
            setUploadingImage(false)
            event.target.value = ""
        }
    }

    const handleRemoveImage = async () => {
        const currentImageUrl = form.getValues("hero_image_url")
        if (currentImageUrl && currentImageUrl.includes('event-images')) {
            try {
                // Extract the path from the full URL
                const urlParts = currentImageUrl.split('/')
                const bucketIndex = urlParts.findIndex(part => part === 'event-images')
                if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
                    const oldPath = urlParts.slice(bucketIndex + 1).join('/')
                    await supabase.storage
                        .from('event-images')
                        .remove([oldPath])
                }
            } catch (error) {
                console.log("Could not delete image:", error)
            }
        }
        form.setValue("hero_image_url", "")
        toast.success("Image removed")
    }

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

            // Sanitize: convert empty strings to null for date, uuid, and url columns
            const payload = {
                ...data,
                recurrence_end_date: data.recurrence_end_date || null,
                recurrence_rule: (!data.recurrence_rule || data.recurrence_rule === "none") ? null : data.recurrence_rule,
                coordinator_id: data.coordinator_id || null,
                venue_id: data.venue_id || null,
                speaker_facilitator_id: data.speaker_facilitator_id || null,
                hero_image_url: data.hero_image_url || null,
                facebook_url: data.facebook_url || null,
                instagram_url: data.instagram_url || null,
                youtube_url: data.youtube_url || null,
                stream_url: data.stream_url || null,
                capacity: data.capacity || null,
                budget: data.budget || null,
            }

            const { error } = initialData?.id
                ? await supabase.from("temple_events").update(payload).eq("id", initialData.id)
                : await supabase.from("temple_events").insert(payload)

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
                name="subtitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl><Textarea {...field} rows={2} placeholder="Optional subtitle shown below the event title" /></FormControl>
                        <FormDescription>
                            Optional subtitle that appears below the event name on the event page
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Hero Image Upload */}
            <FormField
                control={form.control}
                name="hero_image_url"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hero Image</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                {field.value && (
                                    <div className="relative w-full max-w-md">
                                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={field.value}
                                                alt="Hero image preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                aria-label="Remove image"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {uploadingImage ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 mb-2 text-gray-500 animate-spin" />
                                                    <p className="text-sm text-gray-500">Uploading...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                                    </svg>
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 10MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                            </div>
                        </FormControl>
                        <FormDescription>
                            Upload a hero image for the event page. Recommended size: 1200x600px
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Social Media Links Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Media Links</h3>
                
                <FormField
                    control={form.control}
                    name="facebook_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Facebook URL</FormLabel>
                            <FormControl>
                                <Input {...field} type="url" placeholder="https://www.facebook.com/..." />
                            </FormControl>
                            <FormDescription>
                                Optional Facebook page or profile URL
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="instagram_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Instagram URL</FormLabel>
                            <FormControl>
                                <Input {...field} type="url" placeholder="https://www.instagram.com/..." />
                            </FormControl>
                            <FormDescription>
                                Optional Instagram profile URL
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="youtube_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>YouTube URL</FormLabel>
                            <FormControl>
                                <Input {...field} type="url" placeholder="https://www.youtube.com/channel/..." />
                            </FormControl>
                            <FormDescription>
                                Optional YouTube channel URL
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* WhatsApp Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">WhatsApp Details</h3>
                
                <FormField
                    control={form.control}
                    name="whatsapp_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="918988606060" />
                            </FormControl>
                            <FormDescription>
                                WhatsApp number with country code (e.g., 918988606060 for +91 8988606060)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="whatsapp_message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>WhatsApp Message</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} placeholder="Pre-filled message for WhatsApp" />
                            </FormControl>
                            <FormDescription>
                                Optional pre-filled message that will be sent when users click WhatsApp button
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Contact Information */}
            <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="+91 8988606060" />
                        </FormControl>
                        <FormDescription>
                            Contact phone number displayed in event details section
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Venue, capacity, recurrence, speaker, stream */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Venue &amp; capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="venue_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Venue</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select venue" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {venues.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)} placeholder="Max attendees" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="recurrence_rule"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Recurrence</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="recurrence_end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Recurrence end date</FormLabel>
                                <FormControl><Input {...field} type="date" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="speaker_facilitator_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Speaker / Facilitator</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name || ""}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget (₹)</FormLabel>
                            <FormControl>
                                <Input type="number" min={0} {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stream_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Live stream URL</FormLabel>
                            <FormControl>
                                <Input {...field} type="url" placeholder="https://..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="stream_embed"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stream embed HTML</FormLabel>
                            <FormControl>
                                <Textarea {...field} rows={3} placeholder="<iframe ...></iframe>" />
                            </FormControl>
                            <FormDescription>Optional iframe HTML for embedded player</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

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

            <FormField
                control={form.control}
                name="is_active"
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
                                Active Event
                            </FormLabel>
                            <FormDescription>
                                When deactivated, the event URL will show a message that it cannot be accessed. The event will remain in the system but won't be accessible publicly.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />

        </FormWrapper>
    )
}
