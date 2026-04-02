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

type PO = {
    id: string
    po_number: string
    vendor_id: string | null
    status: string
    order_date: string
    expected_date: string | null
    total_amount: number
    notes: string | null
    vendors: { name: string } | null
}

const STATUSES = ["Draft", "Submitted", "Approved", "Received", "Cancelled"]
const STATUS_TRANSITIONS: Record<string, string[]> = {
    Draft: ["Submitted", "Cancelled"],
    Submitted: ["Approved", "Cancelled"],
    Approved: ["Received", "Cancelled"],
    Received: [],
    Cancelled: [],
}

export default function PurchaseOrdersPage() {
    const supabase = createClient()
    const [data, setData] = useState<PO[]>([])
    const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<PO | null>(null)
    const [form, setForm] = useState({ vendor_id: "", order_date: new Date().toISOString().slice(0, 10), expected_date: "", total_amount: "", notes: "" })

    const fetchData = async () => {
        const { data: pos } = await supabase.from("purchase_orders").select("*, vendors(name)").order("order_date", { ascending: false })
        setData((pos as PO[]) || [])
    }
    const fetchVendors = async () => {
        const { data } = await supabase.from("vendors").select("id, name").order("name")
        setVendors(data || [])
    }
    useEffect(() => { fetchData(); fetchVendors() }, [])
    const resetForm = () => { setForm({ vendor_id: "", order_date: new Date().toISOString().slice(0, 10), expected_date: "", total_amount: "", notes: "" }); setEditing(null) }

    const save = async () => {
        const payload: any = {
            order_date: form.order_date,
            expected_date: form.expected_date || null,
            total_amount: form.total_amount ? parseFloat(form.total_amount) : 0,
            notes: form.notes.trim() || null,
        }
        if (form.vendor_id) payload.vendor_id = form.vendor_id
        if (editing) {
            const { error } = await supabase.from("purchase_orders").update(payload).eq("id", editing.id)
            if (error) { toast.error(error.message); return }
            toast.success("PO updated")
        } else {
            payload.status = "Draft"
            const { error } = await supabase.from("purchase_orders").insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success("PO created")
        }
        setOpen(false); resetForm(); fetchData()
    }

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase.from("purchase_orders").update({ status }).eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success(`Status updated to ${status}`)
        fetchData()
    }

    const columns: ColumnDef<PO>[] = [
        { accessorKey: "po_number", header: "PO #" },
        { accessorKey: "order_date", header: "Date" },
        { id: "vendor", header: "Vendor", cell: ({ row }) => row.original.vendors?.name || "—" },
        { accessorKey: "total_amount", header: "Amount", cell: ({ row }) => row.original.total_amount ? `INR ${row.original.total_amount}` : "—" },
        { accessorKey: "expected_date", header: "Expected", cell: ({ row }) => row.original.expected_date || "—" },
        {
            accessorKey: "status", header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status} />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const next = STATUS_TRANSITIONS[row.original.status] || []
                return (
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setEditing(row.original); setForm({ vendor_id: row.original.vendor_id || "", order_date: row.original.order_date, expected_date: row.original.expected_date || "", total_amount: row.original.total_amount?.toString() || "", notes: row.original.notes || "" }); setOpen(true) }}>Edit</DropdownMenuItem>
                        {next.map((s) => <DropdownMenuItem key={s} onClick={() => updateStatus(row.original.id, s)}>Mark {s}</DropdownMenuItem>)}
                    </DropdownMenuContent></DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Purchase Orders</h2><p className="text-sm text-muted-foreground mt-1">Create and track purchase orders.</p></div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
                    <SheetTrigger asChild><Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" /> New PO</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>{editing ? "Edit PO" : "New Purchase Order"}</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Vendor</Label><Select value={form.vendor_id} onValueChange={(v) => setForm((f) => ({ ...f, vendor_id: v }))}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Order Date</Label><Input type="date" value={form.order_date} onChange={(e) => setForm((f) => ({ ...f, order_date: e.target.value }))} /></div>
                            <div><Label>Expected Delivery</Label><Input type="date" value={form.expected_date} onChange={(e) => setForm((f) => ({ ...f, expected_date: e.target.value }))} /></div>
                            <div><Label>Total Amount</Label><Input type="number" value={form.total_amount} onChange={(e) => setForm((f) => ({ ...f, total_amount: e.target.value }))} /></div>
                            <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
                            <Button onClick={save}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
