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

type FixedAsset = {
    id: string; name: string; category: string; purchase_date: string | null; purchase_value: number | null
    current_value: number | null; location: string | null; barcode_or_rfid: string | null
    depreciation_method: string | null; useful_life_years: number | null
}

const CATEGORIES = ["Land", "Building", "Vehicle", "Equipment"]

export default function FixedAssetsPage() {
    const supabase = createClient()
    const [data, setData] = useState<FixedAsset[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<FixedAsset | null>(null)
    const [form, setForm] = useState({ name: "", category: "Equipment", purchase_date: "", purchase_value: "", current_value: "", location: "", barcode_or_rfid: "", depreciation_method: "", useful_life_years: "" })

    const fetchData = async () => { const { data } = await supabase.from("fixed_assets").select("*").order("name"); setData((data as FixedAsset[]) || []) }
    useEffect(() => { fetchData() }, [])
    const resetForm = () => { setForm({ name: "", category: "Equipment", purchase_date: "", purchase_value: "", current_value: "", location: "", barcode_or_rfid: "", depreciation_method: "", useful_life_years: "" }); setEditing(null) }

    const save = async () => {
        if (!form.name.trim()) { toast.error("Name required"); return }
        const payload: any = {
            name: form.name.trim(), category: form.category,
            purchase_date: form.purchase_date || null,
            purchase_value: form.purchase_value ? parseFloat(form.purchase_value) : null,
            current_value: form.current_value ? parseFloat(form.current_value) : null,
            location: form.location.trim() || null,
            barcode_or_rfid: form.barcode_or_rfid.trim() || null,
            depreciation_method: form.depreciation_method.trim() || null,
            useful_life_years: form.useful_life_years ? parseInt(form.useful_life_years) : null,
        }
        if (editing) {
            const { error } = await supabase.from("fixed_assets").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Asset updated")
        } else {
            const { error } = await supabase.from("fixed_assets").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Asset added")
        }
        setOpen(false); resetForm(); fetchData()
    }

    const deleteAsset = async (id: string) => { const { error } = await supabase.from("fixed_assets").delete().eq("id", id); if (error) { toast.error(error.message); return }; toast.success("Deleted"); fetchData() }

    const columns: ColumnDef<FixedAsset>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
        { accessorKey: "purchase_date", header: "Purchased", cell: ({ row }) => row.original.purchase_date || "—" },
        { accessorKey: "purchase_value", header: "Value", cell: ({ row }) => row.original.purchase_value ? `INR ${row.original.purchase_value.toLocaleString()}` : "—" },
        { accessorKey: "current_value", header: "Current", cell: ({ row }) => row.original.current_value ? `INR ${row.original.current_value.toLocaleString()}` : "—" },
        { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location || "—" },
        { id: "actions", cell: ({ row }) => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { const a = row.original; setEditing(a); setForm({ name: a.name, category: a.category, purchase_date: a.purchase_date || "", purchase_value: a.purchase_value?.toString() || "", current_value: a.current_value?.toString() || "", location: a.location || "", barcode_or_rfid: a.barcode_or_rfid || "", depreciation_method: a.depreciation_method || "", useful_life_years: a.useful_life_years?.toString() || "" }); setOpen(true) }}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => deleteAsset(row.original.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
        )},
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Fixed Assets</h2><p className="text-sm text-muted-foreground mt-1">Track land, buildings, vehicles, and equipment.</p></div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Asset</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>{editing ? "Edit Asset" : "Add Fixed Asset"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
                            <div><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm((f) => ({ ...f, purchase_date: e.target.value }))} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Purchase Value</Label><Input type="number" value={form.purchase_value} onChange={(e) => setForm((f) => ({ ...f, purchase_value: e.target.value }))} /></div>
                                <div><Label>Current Value</Label><Input type="number" value={form.current_value} onChange={(e) => setForm((f) => ({ ...f, current_value: e.target.value }))} /></div>
                            </div>
                            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></div>
                            <div><Label>Barcode / RFID</Label><Input value={form.barcode_or_rfid} onChange={(e) => setForm((f) => ({ ...f, barcode_or_rfid: e.target.value }))} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Depreciation</Label><Input value={form.depreciation_method} onChange={(e) => setForm((f) => ({ ...f, depreciation_method: e.target.value }))} placeholder="e.g. Straight-line" /></div>
                                <div><Label>Useful Life (yrs)</Label><Input type="number" value={form.useful_life_years} onChange={(e) => setForm((f) => ({ ...f, useful_life_years: e.target.value }))} /></div>
                            </div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
