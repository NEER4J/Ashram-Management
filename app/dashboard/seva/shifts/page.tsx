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

type Shift = {
    id: string
    opportunity_id: string
    shift_date: string
    start_time: string
    end_time: string
    slots_needed: number
    created_at: string
    seva_opportunities: { name: string; category: string } | null
}

export default function ShiftsPage() {
    const supabase = createClient()
    const [data, setData] = useState<Shift[]>([])
    const [opportunities, setOpportunities] = useState<{ id: string; name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Shift | null>(null)
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
    const [form, setForm] = useState({ opportunity_id: "", shift_date: new Date().toISOString().slice(0, 10), start_time: "06:00", end_time: "12:00", slots_needed: 1 })

    const fetchData = async () => {
        let query = supabase.from("seva_shifts").select("*, seva_opportunities(name, category)").order("shift_date", { ascending: false }).order("start_time")
        if (dateFilter) query = query.gte("shift_date", dateFilter)
        const { data: shifts } = await query
        setData((shifts as Shift[]) || [])
    }

    const fetchOpportunities = async () => {
        const { data } = await supabase.from("seva_opportunities").select("id, name").eq("is_active", true).order("name")
        setOpportunities(data || [])
    }

    useEffect(() => { fetchData(); fetchOpportunities() }, [dateFilter])

    const resetForm = () => {
        setForm({ opportunity_id: "", shift_date: new Date().toISOString().slice(0, 10), start_time: "06:00", end_time: "12:00", slots_needed: 1 })
        setEditing(null)
    }

    const save = async () => {
        if (!form.opportunity_id) { toast.error("Select an opportunity"); return }
        const payload = {
            opportunity_id: form.opportunity_id,
            shift_date: form.shift_date,
            start_time: form.start_time,
            end_time: form.end_time,
            slots_needed: form.slots_needed,
        }
        if (editing) {
            const { error } = await supabase.from("seva_shifts").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Shift updated")
        } else {
            const { error } = await supabase.from("seva_shifts").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Shift created")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteShift = async (id: string) => {
        const { error } = await supabase.from("seva_shifts").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Shift deleted")
        fetchData()
    }

    const columns: ColumnDef<Shift>[] = [
        { accessorKey: "shift_date", header: "Date" },
        {
            id: "opportunity",
            header: "Opportunity",
            cell: ({ row }) => row.original.seva_opportunities?.name || "—",
        },
        {
            id: "category",
            header: "Category",
            cell: ({ row }) => row.original.seva_opportunities?.category || "—",
        },
        { accessorKey: "start_time", header: "Start" },
        { accessorKey: "end_time", header: "End" },
        { accessorKey: "slots_needed", header: "Slots" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const s = row.original
                            setEditing(s)
                            setForm({
                                opportunity_id: s.opportunity_id,
                                shift_date: s.shift_date,
                                start_time: s.start_time,
                                end_time: s.end_time,
                                slots_needed: s.slots_needed,
                            })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteShift(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Shifts</h2>
                    <p className="text-sm text-muted-foreground mt-1">Schedule and manage seva shifts.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Add Shift</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Shift" : "Add Shift"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Opportunity</Label>
                                <Select value={form.opportunity_id} onValueChange={(v) => setForm((f) => ({ ...f, opportunity_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select opportunity" /></SelectTrigger>
                                    <SelectContent>
                                        {opportunities.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div><Label>Date</Label><Input type="date" value={form.shift_date} onChange={(e) => setForm((f) => ({ ...f, shift_date: e.target.value }))} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} /></div>
                                <div><Label>End Time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} /></div>
                            </div>
                            <div><Label>Slots Needed</Label><Input type="number" value={form.slots_needed} onChange={(e) => setForm((f) => ({ ...f, slots_needed: parseInt(e.target.value) || 1 }))} /></div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex gap-4 items-center">
                <Label>From date</Label>
                <Input type="date" className="w-48" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>All shifts</Button>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
