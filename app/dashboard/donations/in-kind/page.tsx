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
import Link from "next/link"

type InKindDonation = {
    id: string
    donation_date: string
    item_type: string
    description: string | null
    quantity: number
    unit: string
    estimated_value: number | null
    condition: string | null
    receipt_number: string | null
    destination: string | null
    acknowledgement_status: string | null
    currency: string
    created_at: string
    devotee_id: string | null
    devotees: { first_name: string; last_name: string } | null
}

const ITEM_TYPES = ["grains", "clothes", "books", "equipment", "furniture", "vehicles", "medical_supplies", "kitchen_supplies", "religious_items", "electronics", "bedding", "other"]
const CONDITIONS = ["New", "Good", "Fair", "Needs Repair"]
const DESTINATIONS = ["Kitchen", "Guest House", "Temple", "Office", "Distribution", "Storage", "Other"]
const ACK_STATUSES = ["Pending", "Sent", "Not Required"]
const CURRENCIES = ["INR", "USD", "GBP", "EUR", "AUD", "SGD", "MYR", "THB"]

export default function InKindDonationsPage() {
    const supabase = createClient()
    const [data, setData] = useState<InKindDonation[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<InKindDonation | null>(null)
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string | null }[]>([])
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [form, setForm] = useState({
        devotee_id: "", donation_date: new Date().toISOString().slice(0, 10), item_type: "grains",
        description: "", quantity: 1, unit: "PCS", estimated_value: "", condition: "Good",
        destination: "", acknowledgement_status: "Pending", currency: "INR",
    })

    const fetchData = async () => {
        let query = supabase.from("in_kind_donations").select("*, devotees(first_name, last_name)").order("donation_date", { ascending: false })
        if (dateFrom) query = query.gte("donation_date", dateFrom)
        if (dateTo) query = query.lte("donation_date", dateTo)
        const { data: list } = await query
        setData((list as InKindDonation[]) || [])
    }

    useEffect(() => {
        fetchData()
        supabase.from("devotees").select("id, first_name, last_name").order("first_name").limit(200).then(({ data: d }) => setDevotees(d || []))
    }, [dateFrom, dateTo])

    const resetForm = () => {
        setForm({ devotee_id: "", donation_date: new Date().toISOString().slice(0, 10), item_type: "grains", description: "", quantity: 1, unit: "PCS", estimated_value: "", condition: "Good", destination: "", acknowledgement_status: "Pending", currency: "INR" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.description.trim() && !form.item_type) { toast.error("Description or item type required"); return }
        const payload: any = {
            devotee_id: form.devotee_id || null,
            donation_date: form.donation_date,
            item_type: form.item_type,
            description: form.description.trim() || null,
            quantity: form.quantity,
            unit: form.unit,
            estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
            condition: form.condition || null,
            destination: form.destination || null,
            acknowledgement_status: form.acknowledgement_status,
            currency: form.currency,
        }
        if (editing) {
            const { error } = await supabase.from("in_kind_donations").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Donation updated")
        } else {
            const { error } = await supabase.from("in_kind_donations").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Donation recorded")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteDonation = async (id: string) => {
        const { error } = await supabase.from("in_kind_donations").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Donation deleted")
        fetchData()
    }

    const columns: ColumnDef<InKindDonation>[] = [
        { accessorKey: "receipt_number", header: "Receipt #", cell: ({ row }) => row.original.receipt_number || "—" },
        { accessorKey: "donation_date", header: "Date" },
        {
            id: "donor", header: "Donor",
            cell: ({ row }) => row.original.devotees ? `${row.original.devotees.first_name} ${row.original.devotees.last_name || ""}`.trim() : "Anonymous",
        },
        { accessorKey: "item_type", header: "Type", cell: ({ row }) => row.original.item_type.replace(/_/g, " ") },
        { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description || "—" },
        { accessorKey: "quantity", header: "Qty", cell: ({ row }) => `${row.original.quantity} ${row.original.unit}` },
        {
            id: "value", header: "Value",
            cell: ({ row }) => row.original.estimated_value ? `${row.original.currency} ${row.original.estimated_value}` : "—",
        },
        { accessorKey: "condition", header: "Condition", cell: ({ row }) => row.original.condition || "—" },
        { accessorKey: "destination", header: "Destination", cell: ({ row }) => row.original.destination || "—" },
        {
            accessorKey: "acknowledgement_status", header: "Ack",
            cell: ({ row }) => {
                const s = row.original.acknowledgement_status
                const color = s === "Sent" ? "text-green-600" : s === "Pending" ? "text-amber-600" : ""
                return <span className={color}>{s || "—"}</span>
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const d = row.original
                            setEditing(d)
                            setForm({
                                devotee_id: d.devotee_id || "", donation_date: d.donation_date, item_type: d.item_type,
                                description: d.description || "", quantity: d.quantity, unit: d.unit,
                                estimated_value: d.estimated_value?.toString() || "", condition: d.condition || "Good",
                                destination: d.destination || "", acknowledgement_status: d.acknowledgement_status || "Pending",
                                currency: d.currency || "INR",
                            })
                            setOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => deleteDonation(row.original.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">In-Kind Donations</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track material donations: grains, clothes, equipment, and more.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link href="/dashboard/donations">Cash Donations</Link></Button>
                    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                        <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Record Donation</Button></SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                            <SheetHeader><SheetTitle>{editing ? "Edit Donation" : "Record In-Kind Donation"}</SheetTitle></SheetHeader>
                            <div className="space-y-4 py-6">
                                <div>
                                    <Label>Donor (optional)</Label>
                                    <Select value={form.devotee_id} onValueChange={(v) => setForm((f) => ({ ...f, devotee_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Anonymous" /></SelectTrigger>
                                        <SelectContent>
                                            {devotees.map((d) => <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name || ""}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Date</Label><Input type="date" value={form.donation_date} onChange={(e) => setForm((f) => ({ ...f, donation_date: e.target.value }))} /></div>
                                <div>
                                    <Label>Item Type</Label>
                                    <Select value={form.item_type} onValueChange={(v) => setForm((f) => ({ ...f, item_type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{ITEM_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. Rice, 5 kg bags" /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} /></div>
                                    <div><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="PCS, kg" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div><Label>Estimated Value</Label><Input type="number" value={form.estimated_value} onChange={(e) => setForm((f) => ({ ...f, estimated_value: e.target.value }))} placeholder="Optional" /></div>
                                    <div>
                                        <Label>Currency</Label>
                                        <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div>
                                    <Label>Condition</Label>
                                    <Select value={form.condition} onValueChange={(v) => setForm((f) => ({ ...f, condition: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Destination</Label>
                                    <Select value={form.destination} onValueChange={(v) => setForm((f) => ({ ...f, destination: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Where will this be used?" /></SelectTrigger>
                                        <SelectContent>{DESTINATIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Acknowledgement</Label>
                                    <Select value={form.acknowledgement_status} onValueChange={(v) => setForm((f) => ({ ...f, acknowledgement_status: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{ACK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={save}>Save</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
                <div><Label>From</Label><Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
                <div><Label>To</Label><Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
                {(dateFrom || dateTo) && <Button variant="outline" size="sm" onClick={() => { setDateFrom(""); setDateTo("") }}>Clear</Button>}
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
