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
import { Plus } from "lucide-react"
import { toast } from "sonner"

type Transfer = {
    id: string
    item_id: string
    from_location_id: string | null
    to_location_id: string | null
    quantity: number
    status: string
    notes: string | null
    transferred_at: string
    inventory_items: { name: string } | null
    from_location: { name: string } | null
    to_location: { name: string } | null
}

export default function TransfersPage() {
    const supabase = createClient()
    const [data, setData] = useState<Transfer[]>([])
    const [items, setItems] = useState<{ id: string; name: string }[]>([])
    const [locations, setLocations] = useState<{ id: string; name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ item_id: "", from_location_id: "", to_location_id: "", quantity: 1, notes: "" })

    const fetchData = async () => {
        const { data: transfers } = await supabase.from("inventory_transfers").select("*, inventory_items(name), from_location:inventory_locations!from_location_id(name), to_location:inventory_locations!to_location_id(name)").order("transferred_at", { ascending: false })
        setData((transfers as Transfer[]) || [])
    }
    const fetchItems = async () => { const { data } = await supabase.from("inventory_items").select("id, name").order("name"); setItems(data || []) }
    const fetchLocations = async () => { const { data } = await supabase.from("inventory_locations").select("id, name").order("name"); setLocations(data || []) }

    useEffect(() => { fetchData(); fetchItems(); fetchLocations() }, [])

    const save = async () => {
        if (!form.item_id || !form.to_location_id) { toast.error("Item and destination required"); return }
        const { error } = await supabase.from("inventory_transfers").insert({
            item_id: form.item_id,
            from_location_id: form.from_location_id || null,
            to_location_id: form.to_location_id,
            quantity: form.quantity,
            notes: form.notes.trim() || null,
            status: "Completed",
        })
        if (error) { toast.error(error.message); return }
        toast.success("Transfer recorded")
        setOpen(false)
        setForm({ item_id: "", from_location_id: "", to_location_id: "", quantity: 1, notes: "" })
        fetchData()
    }

    const columns: ColumnDef<Transfer>[] = [
        { accessorKey: "transferred_at", header: "Date", cell: ({ row }) => new Date(row.original.transferred_at).toLocaleDateString() },
        { id: "item", header: "Item", cell: ({ row }) => row.original.inventory_items?.name || "—" },
        { id: "from", header: "From", cell: ({ row }) => row.original.from_location?.name || "—" },
        { id: "to", header: "To", cell: ({ row }) => row.original.to_location?.name || "—" },
        { accessorKey: "quantity", header: "Qty" },
        { accessorKey: "status", header: "Status" },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Transfers</h2><p className="text-sm text-muted-foreground mt-1">Move items between locations.</p></div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New Transfer</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>Record Transfer</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Item</Label><Select value={form.item_id} onValueChange={(v) => setForm((f) => ({ ...f, item_id: v }))}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>From Location</Label><Select value={form.from_location_id} onValueChange={(v) => setForm((f) => ({ ...f, from_location_id: v }))}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>To Location</Label><Select value={form.to_location_id} onValueChange={(v) => setForm((f) => ({ ...f, to_location_id: v }))}><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger><SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} /></div>
                            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                            <Button onClick={save}>Record Transfer</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
