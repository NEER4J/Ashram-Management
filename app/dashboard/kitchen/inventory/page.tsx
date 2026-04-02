"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type KitchenItem = {
    id: string
    item_name: string
    category: string | null
    quantity: number
    unit: string
    min_level: number
    expiry_date: string | null
}

const CATEGORIES = ["Grains", "Spices", "Vegetables", "Dairy", "Oil", "Fruits", "Beverages", "Dry Fruits", "Cleaning", "Other"]
const UNITS = ["kg", "g", "L", "mL", "PCS", "packets", "boxes", "bags"]

export default function KitchenInventoryPage() {
    const supabase = createClient()
    const [data, setData] = useState<KitchenItem[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<KitchenItem | null>(null)
    const [form, setForm] = useState({ item_name: "", category: "", quantity: 0, unit: "kg", min_level: 0, expiry_date: "" })

    const fetchData = async () => {
        const { data: items } = await supabase.from("kitchen_inventory").select("*").order("item_name")
        setData((items as KitchenItem[]) || [])
    }

    useEffect(() => { fetchData() }, [])

    const resetForm = () => {
        setForm({ item_name: "", category: "", quantity: 0, unit: "kg", min_level: 0, expiry_date: "" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.item_name.trim()) { toast.error("Item name required"); return }
        const payload = {
            item_name: form.item_name.trim(),
            category: form.category || null,
            quantity: form.quantity,
            unit: form.unit,
            min_level: form.min_level,
            expiry_date: form.expiry_date || null,
        }
        if (editing) {
            const { error } = await supabase.from("kitchen_inventory").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Item updated")
        } else {
            const { error } = await supabase.from("kitchen_inventory").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Item added")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteItem = async (id: string) => {
        const { error } = await supabase.from("kitchen_inventory").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Item deleted")
        fetchData()
    }

    const columns: ColumnDef<KitchenItem>[] = [
        { accessorKey: "item_name", header: "Item" },
        { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category || "—" },
        {
            accessorKey: "quantity",
            header: "Stock",
            cell: ({ row }) => {
                const isLow = row.original.quantity <= row.original.min_level
                return (
                    <div className="flex items-center gap-2">
                        <span className={isLow ? "text-destructive font-semibold" : ""}>{row.original.quantity} {row.original.unit}</span>
                        {isLow && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Low</Badge>}
                    </div>
                )
            },
        },
        { accessorKey: "min_level", header: "Min Level", cell: ({ row }) => `${row.original.min_level} ${row.original.unit}` },
        { accessorKey: "expiry_date", header: "Expiry", cell: ({ row }) => row.original.expiry_date || "—" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const item = row.original
                            setEditing(item)
                            setForm({
                                item_name: item.item_name,
                                category: item.category || "",
                                quantity: item.quantity,
                                unit: item.unit,
                                min_level: item.min_level,
                                expiry_date: item.expiry_date || "",
                            })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Kitchen Inventory</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage kitchen stock and supplies.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Item" : "Add Item"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Item Name</Label><Input value={form.item_name} onChange={(e) => setForm((f) => ({ ...f, item_name: e.target.value }))} /></div>
                            <div>
                                <Label>Category</Label>
                                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} /></div>
                                <div>
                                    <Label>Unit</Label>
                                    <Select value={form.unit} onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div><Label>Min Level</Label><Input type="number" value={form.min_level} onChange={(e) => setForm((f) => ({ ...f, min_level: parseFloat(e.target.value) || 0 }))} /></div>
                            <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))} /></div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
