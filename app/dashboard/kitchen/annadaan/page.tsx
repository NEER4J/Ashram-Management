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

type AnnadaanDonation = {
    id: string
    devotee_id: string | null
    amount: number | null
    in_kind_description: string | null
    donation_date: string
    purpose: string | null
    currency: string
    created_at: string
    devotees: { first_name: string; last_name: string } | null
}

const PURPOSES = ["Daily Langar", "Festival", "Special Occasion", "Memorial", "Sponsorship", "Other"]

export default function AnnadaanPage() {
    const supabase = createClient()
    const [data, setData] = useState<AnnadaanDonation[]>([])
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<AnnadaanDonation | null>(null)
    const [form, setForm] = useState({ devotee_id: "", amount: "", in_kind_description: "", donation_date: new Date().toISOString().slice(0, 10), purpose: "", currency: "INR" })

    const fetchData = async () => {
        const { data: donations } = await supabase.from("annadaan_donations").select("*, devotees(first_name, last_name)").order("donation_date", { ascending: false })
        setData((donations as AnnadaanDonation[]) || [])
    }

    const fetchDevotees = async () => {
        const { data } = await supabase.from("devotees").select("id, first_name, last_name").order("first_name").limit(200)
        setDevotees(data || [])
    }

    useEffect(() => { fetchData(); fetchDevotees() }, [])

    const resetForm = () => {
        setForm({ devotee_id: "", amount: "", in_kind_description: "", donation_date: new Date().toISOString().slice(0, 10), purpose: "", currency: "INR" })
        setEditing(null)
    }

    const save = async () => {
        if (!form.amount && !form.in_kind_description.trim()) { toast.error("Amount or in-kind description required"); return }
        const payload: any = {
            donation_date: form.donation_date,
            amount: form.amount ? parseFloat(form.amount) : null,
            in_kind_description: form.in_kind_description.trim() || null,
            purpose: form.purpose || null,
            currency: form.currency,
        }
        if (form.devotee_id) payload.devotee_id = form.devotee_id
        if (editing) {
            const { error } = await supabase.from("annadaan_donations").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("Donation updated")
        } else {
            const { error } = await supabase.from("annadaan_donations").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("Donation recorded")
        }
        setOpen(false)
        resetForm()
        fetchData()
    }

    const deleteDonation = async (id: string) => {
        const { error } = await supabase.from("annadaan_donations").delete().eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Donation deleted")
        fetchData()
    }

    const columns: ColumnDef<AnnadaanDonation>[] = [
        { accessorKey: "donation_date", header: "Date" },
        {
            id: "donor",
            header: "Donor",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "Anonymous"
            },
        },
        {
            id: "amount",
            header: "Amount",
            cell: ({ row }) => row.original.amount ? `${row.original.currency} ${row.original.amount}` : "—",
        },
        { accessorKey: "in_kind_description", header: "In-Kind", cell: ({ row }) => row.original.in_kind_description || "—" },
        { accessorKey: "purpose", header: "Purpose", cell: ({ row }) => row.original.purpose || "—" },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const d = row.original
                            setEditing(d)
                            setForm({
                                devotee_id: d.devotee_id || "",
                                amount: d.amount?.toString() || "",
                                in_kind_description: d.in_kind_description || "",
                                donation_date: d.donation_date,
                                purpose: d.purpose || "",
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
                    <h2 className="text-2xl font-semibold tracking-tight">Annadaan</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track langar and free food kitchen donations.</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild>
                        <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> Record Donation</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>{editing ? "Edit Donation" : "Record Annadaan Donation"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Donation Date</Label><Input type="date" value={form.donation_date} onChange={(e) => setForm((f) => ({ ...f, donation_date: e.target.value }))} /></div>
                            <div>
                                <Label>Donor (optional for anonymous)</Label>
                                <Select value={form.devotee_id} onValueChange={(v) => setForm((f) => ({ ...f, devotee_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Anonymous" /></SelectTrigger>
                                    <SelectContent>
                                        {devotees.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name || ""}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>Cash Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Optional" /></div>
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
                            <div>
                                <Label>In-Kind Description</Label>
                                <Textarea value={form.in_kind_description} onChange={(e) => setForm((f) => ({ ...f, in_kind_description: e.target.value }))} placeholder="e.g. 50 kg rice, 10 kg dal..." />
                            </div>
                            <div>
                                <Label>Purpose</Label>
                                <Select value={form.purpose} onValueChange={(v) => setForm((f) => ({ ...f, purpose: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                                    <SelectContent>
                                        {PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
