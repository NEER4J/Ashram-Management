import { z } from "zod"

export const inventoryItemSchema = z.object({
    name: z.string().min(2, "Item Name is required"),
    category: z.string().optional(),
    unit: z.string().optional().default("PCS"),
    current_stock: z.coerce.number().min(0).optional().default(0),
    min_stock_level: z.coerce.number().min(0).optional().default(0),
    is_perishable: z.boolean().optional().default(false),
})

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>
