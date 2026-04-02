import { z } from "zod"

export const eventSchema = z.object({
    name: z.string().min(2, "Event Name is required"),
    slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    type: z.string().optional(),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    city: z.string().optional(),
    state: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["Planned", "Confirmed", "In Progress", "Completed", "Cancelled"]).optional().default("Planned"),
    is_published: z.boolean().optional().default(false),
    is_active: z.boolean().optional().default(true),
    coordinator_id: z.string().optional(),
    hero_image_url: z.string().url().optional().or(z.literal("")),
    subtitle: z.string().optional(),
    facebook_url: z.string().url().optional().or(z.literal("")),
    instagram_url: z.string().url().optional().or(z.literal("")),
    youtube_url: z.string().url().optional().or(z.literal("")),
    whatsapp_number: z.string().optional(),
    whatsapp_message: z.string().optional(),
    contact_phone: z.string().optional(),
    venue_id: z.string().optional(),
    capacity: z.number().optional(),
    recurrence_rule: z.string().optional(),
    recurrence_end_date: z.string().optional(),
    speaker_facilitator_id: z.string().optional(),
    stream_url: z.string().url().optional().or(z.literal("")),
    stream_embed: z.string().optional(),
    budget: z.number().optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>

// Helper function to generate slug from name
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}
