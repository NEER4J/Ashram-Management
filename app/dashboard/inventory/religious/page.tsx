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

type ReligiousItem = { id: string; name: string; type: string; quantity: number; location: string | null; is_saleable: boolean }
const TYPES = ["book", "idol", "photo", "puja_material"]

export default function ReligiousItemsPage() {
    const supabase = createClient()
    const [data, setData] = useState<ReligiousItem[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<ReligiousItem | null>(null)
    const [typeFilter, setTypeFilter] = useState("")
    const [form, setForm] = useState({ name: "", type: "puja_material", quantity: 0, location: "", is_saleable: false })

    const fetchData = async () => {
        let query = supabase.from("religious_items").select("*").order("name")
        if (typeFilter) query = query.eq("type", typeFilter)
        const { data: items } = await query
        setData((items as ReligiousItem[]) || [])
    }
    useEffect(() => { fetchData() }, [typeFilter])
    const resetForm = () => { setForm({ name: "", type: "puja_material", quantity: 0, location: "", is_saleable: false }); setEditing(null) }

    const save = async () => {
        if (!form.name.trim()) { toast.error("Name required"); return }
        const payload = { name: form.name.trim(), type: form.type, quantity: form.quantity, location: form.location.trim() || null, is_saleable: form.is_saleable }
        if (editing) {
            const { error } = await supabase.from("religious_items").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Updated")
        } else {
            const { error } = await supabase.from("religious_items").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Added")
        }
        setOpen(false); resetForm(); fetchData()
    }

    const deleteItem = async (id: string) => { const { error } = await supabase.from("religious_items").delete().eq("id", id); if (error) { toast.error(error.message); return }; toast.success("Deleted"); fetchData() }

    const columns: ColumnDef<ReligiousItem>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.type.replace(/_/g, " ")}</Badge> },
        { accessorKey: "quantity", header: "Qty" },
        { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location || "—" },
        {
            accessorKey: "is_saleable", header: "Saleable",
            cell: ({ row }) => row.original.is_saleable
                ? <Badge variant="default" className="bg-green-600 hover:bg-green-700">Yes</Badge>
                : <Badge variant="secondary">No</Badge>,
        },
        { id: "actions", cell: ({ row }) => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { const i = row.original; setEditing(i); setForm({ name: i.name, type: i.type, quantity: i.quantity, location: i.location || "", is_saleable: i.is_saleable }); setOpen(true) }}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(row.original.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
        )},
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Religious Items</h2><p className="text-sm text-muted-foreground mt-1">Manage puja samagri, idols, books, and photos.</p></div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Item</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>{editing ? "Edit Item" : "Add Religious Item"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                            <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} /></div>
                            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
                            <div className="flex items-center gap-2"><input type="checkbox" id="saleable" checked={form.is_saleable} onChange={(e) => setForm((f) => ({ ...f, is_saleable: e.target.checked }))} /><Label htmlFor="saleable">Saleable (for shop)</Label></div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex gap-4 items-center">
                <Label>Filter by type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger><SelectContent><SelectItem value="">All</SelectItem>{TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent></Select>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
