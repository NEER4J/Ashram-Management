"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { InventoryForm } from "./inventory-form"
import { Badge } from "@/components/ui/badge"

export type InventoryItem = {
    id: string
    name: string
    category: string
    current_stock: number
    min_stock_level: number
    unit: string
}

export const columns: ColumnDef<InventoryItem>[] = [
    {
        accessorKey: "name",
        header: "Item Name",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "current_stock",
        header: "Stock",
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.current_stock <= row.original.min_stock_level ? "text-red-600" : ""
                }`}>
                {row.original.current_stock} {row.original.unit}
            </div>
        ),
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isLow = row.original.current_stock <= row.original.min_stock_level
            return (
                <Badge variant={isLow ? "destructive" : "outline"}>
                    {isLow ? "Low Stock" : "In Stock"}
                </Badge>
            )
        },
    },
]

export default function InventoryPage() {
    const [data, setData] = useState<InventoryItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: items } = await supabase
            .from("inventory_items")
            .select("*")
            .order("name", { ascending: true })

        if (items) setData(items)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-muted-foreground">
                        Manage stock items and track inventory levels.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Add Inventory Item</SheetTitle>
                            <SheetDescription>
                                Register a new item in the inventory.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <InventoryForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Filter items..."
            />
        </div>
    )
}
