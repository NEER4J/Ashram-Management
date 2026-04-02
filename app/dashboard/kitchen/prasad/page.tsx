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

type PrasadBooking = {
    id: string
    occasion: string
    booking_date: string
    devotee_id: string | null
    quantity: number
    status: string
    amount: number | null
    currency: string
    created_at: string
    devotees: { first_name: string; last_name: string } | null
}

const STATUSES = ["Pending", "Confirmed", "Prepared", "Distributed", "Cancelled"]
const STATUS_TRANSITIONS: Record<string, string[]> = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Prepared", "Cancelled"],
    Prepared: ["Distributed"],
    Distributed: [],
    Cancelled: [],
}

export default function PrasadBookingsPage() {
    const supabase = createClient()
    const [data, setData] = useState<PrasadBooking[]>([])
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<PrasadBooking | null>(null)
    const [form, setForm] = useState({ occasion: "", booking_date: new Date().toISOString().slice(0, 10), devotee_id: "", quantity: 1, amount: "", currency: "INR" })

    const fetchData = async () => {
        const { data: bookings } = await supabase.from("prasad_bookings").select("*, devotees(first_name, last_name)").order("booking_date", { ascending: false })
        setData((bookings as PrasadBooking[]) || [])
    }

    const fetchDevotees = async () => {
        const { data } = await supabase.from("devotees").select("id, first_name, last_name").order("first_name").limit(200)
        setDevotees(data || [])
    }

    useEffect(() => { fetchData(); fetchDevotees() }, [])

    const resetForm = () => {
        setForm({ occasion: "", booking_date: new Date().toISOString().slice(0, 10), devotee_id: "", quantity: 1, amount: "", currency: "INR" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.occasion.trim()) { toast.error("Occasion required"); return }
        const payload: any = {
            occasion: form.occasion.trim(),
            booking_date: form.booking_date,
            quantity: form.quantity,
            amount: form.amount ? parseFloat(form.amount) : null,
            currency: form.currency,
        }
        if (form.devotee_id) payload.devotee_id = form.devotee_id
        if (editing) {
            const { error } = await supabase.from("prasad_bookings").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Booking updated")
        } else {
            payload.status = "Pending"
            const { error } = await supabase.from("prasad_bookings").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Booking created")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from("prasad_bookings").update({ status: newStatus }).eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success(`Status updated to ${newStatus}`)
        fetchData()
    }

    const columns: ColumnDef<PrasadBooking>[] = [
        { accessorKey: "booking_date", header: "Date" },
        { accessorKey: "occasion", header: "Occasion" },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "—"
            },
        },
        { accessorKey: "quantity", header: "Qty" },
        {
            id: "amount",
            header: "Amount",
            cell: ({ row }) => row.original.amount ? `${row.original.currency} ${row.original.amount}` : "—",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const nextStatuses = STATUS_TRANSITIONS[row.original.status] || []
                if (nextStatuses.length === 0) return null
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                                const b = row.original
                                setEditing(b)
                                setForm({
                                    occasion: b.occasion,
                                    booking_date: b.booking_date,
                                    devotee_id: b.devotee_id || "",
                                    quantity: b.quantity,
                                    amount: b.amount?.toString() || "",
                                    currency: b.currency || "INR",
                                })
                                setOpen(true)
                            }}>Edit</DropdownMenuItem>
                            {nextStatuses.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => updateStatus(row.original.id, s)}>
                                    Mark as {s}
                                </DropdownMenuItem>
                            ))}
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
                    <h2 className="text-2xl font-semibold tracking-tight">Prasad Bookings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage devotee prasad reservations and distribution.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> New Booking</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Booking" : "New Prasad Booking"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Occasion</Label><Input value={form.occasion} onChange={(e) => setForm((f) => ({ ...f, occasion: e.target.value }))} placeholder="e.g. Ganesh Chaturthi" /></div>
                            <div><Label>Booking Date</Label><Input type="date" value={form.booking_date} onChange={(e) => setForm((f) => ({ ...f, booking_date: e.target.value }))} /></div>
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
                            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Optional" /></div>
                                <div>
                                    <Label>Currency</Label>
                                    <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["INR", "USD", "GBP", "EUR", "AUD", "SGD", "MYR", "THB"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
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
