import { z } from "zod"

export const studyMaterialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["Book", "PDF", "Video", "Audio"]),
    price: z.coerce.number().min(0, "Price must be 0 or greater").default(0),
    is_free: z.boolean().default(false),
    is_published: z.boolean().default(false),
    cover_image_url: z.string().optional(),
    author: z.string().optional(),
    language: z.string().default("English"),
    stock_quantity: z.coerce.number().min(0).default(0),
    is_digital: z.boolean().default(true),
    file_urls: z.array(z.string()).default([]),
    metadata: z.record(z.any()).optional(),
})

export type StudyMaterialFormValues = z.infer<typeof studyMaterialSchema>

