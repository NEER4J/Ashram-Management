import { z } from "zod"

export const eventSchema = z.object({
    name: z.string().min(2, "Event Name is required"),
    type: z.string().optional(),
    start_date: z.string().min(1, "Start Date is required"),
    end_date: z.string().min(1, "End Date is required"),
    description: z.string().optional(),
    budget: z.coerce.number().optional().default(0),
    status: z.enum(["Planned", "Confirmed", "In Progress", "Completed", "Cancelled"]).optional().default("Planned"),
    coordinator_id: z.string().optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>
