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
import { StatusBadge } from "@/components/ui/status-badge"

type Assignment = {
    id: string
    shift_id: string
    volunteer_id: string
    status: string
    hours_actual: number | null
    created_at: string
    seva_shifts: { shift_date: string; start_time: string; end_time: string; seva_opportunities: { name: string } | null } | null
    volunteers: { devotees: { first_name: string; last_name: string } | null } | null
}

export default function AssignmentsPage() {
    const supabase = createClient()
    const [data, setData] = useState<Assignment[]>([])
    const [shifts, setShifts] = useState<{ id: string; shift_date: string; start_time: string; end_time: string; seva_opportunities: { name: string } | null }[]>([])
    const [volunteers, setVolunteers] = useState<{ id: string; devotees: { first_name: string; last_name: string } | null }[]>([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ shift_id: "", volunteer_id: "" })

    const fetchData = async () => {
        const { data: assigns } = await supabase.from("seva_assignments").select("*, seva_shifts(shift_date, start_time, end_time, seva_opportunities(name)), volunteers(devotees(first_name, last_name))").order("created_at", { ascending: false })
        setData((assigns as Assignment[]) || [])
    }

    const fetchShifts = async () => {
        const today = new Date().toISOString().slice(0, 10)
        const { data } = await supabase.from("seva_shifts").select("id, shift_date, start_time, end_time, seva_opportunities(name)").gte("shift_date", today).order("shift_date")
        setShifts(data || [])
    }

    const fetchVolunteers = async () => {
        const { data } = await supabase.from("volunteers").select("id, devotees(first_name, last_name)").order("created_at")
        setVolunteers(data || [])
    }

    useEffect(() => { fetchData(); fetchShifts(); fetchVolunteers() }, [])

    const assign = async () => {
        if (!form.shift_id || !form.volunteer_id) { toast.error("Select both shift and volunteer"); return }
        const { error } = await supabase.from("seva_assignments").insert({ shift_id: form.shift_id, volunteer_id: form.volunteer_id })
        if (error) { toast.error(error.message); return }
        toast.success("Volunteer assigned")
        setOpen(false)
        setForm({ shift_id: "", volunteer_id: "" })
        fetchData()
    }

    const updateStatus = async (id: string, status: string, hours?: number) => {
        const payload: any = { status }
        if (hours !== undefined) payload.hours_actual = hours
        const { error } = await supabase.from("seva_assignments").update(payload).eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success(`Marked as ${status}`)
        fetchData()
    }

    const columns: ColumnDef<Assignment>[] = [
        {
            id: "date",
            header: "Date",
            cell: ({ row }) => row.original.seva_shifts?.shift_date || "—",
        },
        {
            id: "opportunity",
            header: "Opportunity",
            cell: ({ row }) => row.original.seva_shifts?.seva_opportunities?.name || "—",
        },
        {
            id: "time",
            header: "Time",
            cell: ({ row }) => {
                const s = row.original.seva_shifts
                return s ? `${s.start_time} - ${s.end_time}` : "—"
            },
        },
        {
            id: "volunteer",
            header: "Volunteer",
            cell: ({ row }) => {
                const d = row.original.volunteers?.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "—"
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status === "NoShow" ? "No Show" : row.original.status} />,
        },
        {
            accessorKey: "hours_actual",
            header: "Hours",
            cell: ({ row }) => row.original.hours_actual ?? "—",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                if (row.original.status !== "Assigned") return null
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                const s = row.original.seva_shifts
                                if (s) {
                                    const start = new Date(`2000-01-01T${s.start_time}`)
                                    const end = new Date(`2000-01-01T${s.end_time}`)
                                    const hours = Math.round(((end.getTime() - start.getTime()) / 3600000) * 100) / 100
                                    updateStatus(row.original.id, "Completed", hours > 0 ? hours : undefined)
                                } else {
                                    updateStatus(row.original.id, "Completed")
                                }
                            }}>Mark Completed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(row.original.id, "NoShow")}>Mark No-Show</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Assignments</h2>
                    <p className="text-sm text-muted-foreground mt-1">Assign volunteers to shifts and track hours.</p>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Assign Volunteer</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Assign Volunteer to Shift</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Shift</Label>
                                <Select value={form.shift_id} onValueChange={(v) => setForm((f) => ({ ...f, shift_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.shift_date} | {s.seva_opportunities?.name || "—"} | {s.start_time}–{s.end_time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Volunteer</Label>
                                <Select value={form.volunteer_id} onValueChange={(v) => setForm((f) => ({ ...f, volunteer_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select volunteer" /></SelectTrigger>
                                    <SelectContent>
                                        {volunteers.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.devotees ? `${v.devotees.first_name} ${v.devotees.last_name || ""}`.trim() : v.id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={assign}>Assign</Button>
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
