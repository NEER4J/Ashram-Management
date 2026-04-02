"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InventoryForm } from "./inventory-form"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export type InventoryItem = {
    id: string
    name: string
    category: string
    current_stock: number
    min_stock_level: number
    unit: string
}

export default function InventoryItemsPage() {
    const [data, setData] = useState<InventoryItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: items } = await supabase.from("inventory_items").select("*").order("name")
        if (items) setData(items)
    }

    useEffect(() => { fetchData() }, [])

    const confirmDelete = async () => {
        if (!itemToDelete) return
        const { error } = await supabase.from("inventory_items").delete().eq("id", itemToDelete.id)
        if (error) toast.error("Failed to delete item")
        else { toast.success("Item deleted"); fetchData() }
        setDeleteDialogOpen(false)
        setItemToDelete(null)
    }

    const columns: ColumnDef<InventoryItem>[] = [
        { accessorKey: "name", header: "Item Name" },
        { accessorKey: "category", header: "Category" },
        {
            accessorKey: "current_stock", header: "Stock",
            cell: ({ row }) => (
                <div className={`font-medium ${row.original.current_stock <= row.original.min_stock_level ? "text-red-600" : ""}`}>
                    {row.original.current_stock} {row.original.unit}
                </div>
            ),
        },
        {
            id: "status", header: "Status",
            cell: ({ row }) => {
                const isLow = row.original.current_stock <= row.original.min_stock_level
                return <Badge variant={isLow ? "destructive" : "outline"}>{isLow ? "Low Stock" : "In Stock"}</Badge>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setEditingItem(row.original); setIsOpen(true) }}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => { setItemToDelete(row.original); setDeleteDialogOpen(true) }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Inventory Items</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage stock items and track inventory levels.</p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingItem(null) }}>
                    <SheetTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button></SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingItem ? "Edit Inventory Item" : "Add Inventory Item"}</SheetTitle>
                            <SheetDescription>{editingItem ? "Update item information." : "Register a new inventory item."}</SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <InventoryForm initialData={editingItem || undefined} onSuccess={() => { setIsOpen(false); setEditingItem(null); fetchData() }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable data={data} columns={columns} searchKey="name" searchPlaceholder="Filter items..." />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item</DialogTitle>
                        <DialogDescription>Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
