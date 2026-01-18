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
