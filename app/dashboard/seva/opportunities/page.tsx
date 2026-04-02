"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type Opportunity = {
    id: string
    name: string
    category: string
    description: string | null
    location: string | null
    is_active: boolean
}

const CATEGORIES = ["Kitchen", "Cleaning", "Security", "Teaching", "Medical", "Events", "Garden", "Office", "Construction", "Other"]

export default function OpportunitiesPage() {
    const supabase = createClient()
    const [data, setData] = useState<Opportunity[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Opportunity | null>(null)
    const [form, setForm] = useState({ name: "", category: "Kitchen", description: "", location: "", is_active: true })

    const fetchData = async () => {
        const { data: opps } = await supabase.from("seva_opportunities").select("*").order("name")
        setData((opps as Opportunity[]) || [])
    }

    useEffect(() => { fetchData() }, [])

    const resetForm = () => {
        setForm({ name: "", category: "Kitchen", description: "", location: "", is_active: true })
        setEditing(null)
    }

    const save = async () => {
        if (!form.name.trim()) { toast.error("Name required"); return }
        const payload = {
            name: form.name.trim(),
            category: form.category,
            description: form.description.trim() || null,
            location: form.location.trim() || null,
            is_active: form.is_active,
        }
        if (editing) {
            const { error } = await supabase.from("seva_opportunities").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Opportunity updated")
        } else {
            const { error } = await supabase.from("seva_opportunities").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Opportunity created")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteOpp = async (id: string) => {
        const { error } = await supabase.from("seva_opportunities").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Opportunity deleted")
        fetchData()
    }

    const columns: ColumnDef<Opportunity>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
        { accessorKey: "location", header: "Location", cell: ({ row }) => row.original.location || "—" },
        {
            accessorKey: "is_active", header: "Status",
            cell: ({ row }) => row.original.is_active
                ? <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                : <Badge variant="secondary">Inactive</Badge>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const o = row.original
                            setEditing(o)
                            setForm({ name: o.name, category: o.category, description: o.description || "", location: o.location || "", is_active: o.is_active })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteOpp(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Seva Opportunities</h2>
                    <p className="text-sm text-muted-foreground mt-1">Create and manage seva opportunities by category.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Opportunity</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Opportunity" : "Add Opportunity"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Kitchen Helper" /></div>
                            <div>
                                <Label>Category</Label>
                                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Optional" /></div>
                            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                                <Label htmlFor="active">Active</Label>
                            </div>
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
