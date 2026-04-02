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

type Location = { id: string; name: string; type: string | null; description: string | null }
const TYPES = ["Warehouse", "Storeroom", "Temple", "Kitchen", "Office", "Outdoor", "Other"]

export default function LocationsPage() {
    const supabase = createClient()
    const [data, setData] = useState<Location[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Location | null>(null)
    const [form, setForm] = useState({ name: "", type: "", description: "" })

    const fetchData = async () => { const { data } = await supabase.from("inventory_locations").select("*").order("name"); setData((data as Location[]) || []) }
    useEffect(() => { fetchData() }, [])
    const resetForm = () => { setForm({ name: "", type: "", description: "" }); setEditing(null) }

    const save = async () => {
        if (!form.name.trim()) { toast.error("Name required"); return }
        const payload = { name: form.name.trim(), type: form.type || null, description: form.description.trim() || null }
        if (editing) {
            const { error } = await supabase.from("inventory_locations").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Location updated")
        } else {
            const { error } = await supabase.from("inventory_locations").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Location added")
        }
        setOpen(false); resetForm(); fetchData()
    }

    const deleteItem = async (id: string) => { const { error } = await supabase.from("inventory_locations").delete().eq("id", id); if (error) { toast.error(error.message); return }; toast.success("Deleted"); fetchData() }

    const columns: ColumnDef<Location>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "type", header: "Type", cell: ({ row }) => row.original.type ? <Badge variant="outline">{row.original.type}</Badge> : "—" },
        { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description || "—" },
        { id: "actions", cell: ({ row }) => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setEditing(row.original); setForm({ name: row.original.name, type: row.original.type || "", description: row.original.description || "" }); setOpen(true) }}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => deleteItem(row.original.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
        )},
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Locations</h2><p className="text-sm text-muted-foreground mt-1">Manage storage areas and warehouses.</p></div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Location</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>{editing ? "Edit Location" : "Add Location"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                            <div><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
