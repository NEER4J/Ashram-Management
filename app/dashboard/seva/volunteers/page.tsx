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

type Volunteer = {
    id: string
    devotee_id: string
    joined_at: string
    category: string | null
    skills: string[] | null
    training_certifications: string | null
    devotees: { first_name: string; last_name: string; mobile_number: string | null } | null
}

const CATEGORIES = ["Regular", "Occasional", "Retired", "Youth"]

export default function VolunteersPage() {
    const supabase = createClient()
    const [data, setData] = useState<Volunteer[]>([])
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Volunteer | null>(null)
    const [categoryFilter, setCategoryFilter] = useState("")
    const [form, setForm] = useState({ devotee_id: "", category: "Regular", skills_text: "", training_certifications: "" })

    const fetchData = async () => {
        let query = supabase.from("volunteers").select("*, devotees(first_name, last_name, mobile_number)").order("joined_at", { ascending: false })
        if (categoryFilter) query = query.eq("category", categoryFilter)
        const { data: vols } = await query
        setData((vols as Volunteer[]) || [])
    }

    const fetchDevotees = async () => {
        const { data } = await supabase.from("devotees").select("id, first_name, last_name").order("first_name").limit(200)
        setDevotees(data || [])
    }

    useEffect(() => { fetchData(); fetchDevotees() }, [categoryFilter])

    const resetForm = () => {
        setForm({ devotee_id: "", category: "Regular", skills_text: "", training_certifications: "" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.devotee_id && !editing) { toast.error("Select a devotee"); return }
        const skills = form.skills_text.split(",").map((s) => s.trim()).filter(Boolean)
        const payload: any = {
            category: form.category,
            skills: skills.length > 0 ? skills : null,
            training_certifications: form.training_certifications.trim() || null,
        }
        if (editing) {
            const { error } = await supabase.from("volunteers").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Volunteer updated")
        } else {
            payload.devotee_id = form.devotee_id
            const { error } = await supabase.from("volunteers").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Volunteer registered")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteVolunteer = async (id: string) => {
        const { error } = await supabase.from("volunteers").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Volunteer removed")
        fetchData()
    }

    const columns: ColumnDef<Volunteer>[] = [
        {
            id: "name",
            header: "Name",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "—"
            },
        },
        {
            id: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.devotees?.mobile_number || "—",
        },
        { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category || "—" },
        {
            accessorKey: "skills",
            header: "Skills",
            cell: ({ row }) => (row.original.skills || []).join(", ") || "—",
        },
        { accessorKey: "joined_at", header: "Joined" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const v = row.original
                            setEditing(v)
                            setForm({
                                devotee_id: v.devotee_id,
                                category: v.category || "Regular",
                                skills_text: (v.skills || []).join(", "),
                                training_certifications: v.training_certifications || "",
                            })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteVolunteer(row.original.id)}>Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Volunteers</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage volunteer roster, skills, and categories.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Register Volunteer</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Volunteer" : "Register Volunteer"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            {!editing && (
                                <div>
                                    <Label>Devotee</Label>
                                    <Select value={form.devotee_id} onValueChange={(v) => setForm((f) => ({ ...f, devotee_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select devotee" /></SelectTrigger>
                                        <SelectContent>
                                            {devotees.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name || ""}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label>Category</Label>
                                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Skills (comma-separated)</Label>
                                <Input value={form.skills_text} onChange={(e) => setForm((f) => ({ ...f, skills_text: e.target.value }))} placeholder="Cooking, Cleaning, Driving..." />
                            </div>
                            <div>
                                <Label>Training / Certifications</Label>
                                <Input value={form.training_certifications} onChange={(e) => setForm((f) => ({ ...f, training_certifications: e.target.value }))} placeholder="Optional" />
                            </div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex gap-4 items-center">
                <Label>Filter by category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
