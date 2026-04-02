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
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type Transaction = {
    id: string
    item_id: string
    transaction_type: string
    quantity: number
    reference_type: string | null
    transaction_date: string
    remarks: string | null
    inventory_items: { name: string } | null
}

const TXN_TYPES = ["IN", "OUT"]
const REF_TYPES = ["Purchase", "Donation", "Usage", "Distribution", "Damage", "Return", "Other"]

export default function TransactionsPage() {
    const supabase = createClient()
    const [data, setData] = useState<Transaction[]>([])
    const [items, setItems] = useState<{ id: string; name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ item_id: "", transaction_type: "IN", quantity: 1, reference_type: "", remarks: "" })

    const fetchData = async () => {
        const { data: txns } = await supabase.from("inventory_transactions").select("*, inventory_items(name)").order("transaction_date", { ascending: false }).limit(200)
        setData((txns as Transaction[]) || [])
    }
    const fetchItems = async () => {
        const { data } = await supabase.from("inventory_items").select("id, name").order("name")
        setItems(data || [])
    }

    useEffect(() => { fetchData(); fetchItems() }, [])

    const save = async () => {
        if (!form.item_id) { toast.error("Select an item"); return }
        const { error } = await supabase.from("inventory_transactions").insert({
            item_id: form.item_id,
            transaction_type: form.transaction_type,
            quantity: form.quantity,
            reference_type: form.reference_type || null,
            remarks: form.remarks.trim() || null,
        })
        if (error) { toast.error(error.message); return }

        // Update current_stock on inventory_items
        const { data: item } = await supabase.from("inventory_items").select("current_stock").eq("id", form.item_id).single()
        if (item) {
            const delta = form.transaction_type === "IN" ? form.quantity : -form.quantity
            await supabase.from("inventory_items").update({ current_stock: (item.current_stock || 0) + delta }).eq("id", form.item_id)
        }

        toast.success("Transaction recorded")
        setOpen(false)
        setForm({ item_id: "", transaction_type: "IN", quantity: 1, reference_type: "", remarks: "" })
        fetchData()
    }

    const columns: ColumnDef<Transaction>[] = [
        { accessorKey: "transaction_date", header: "Date", cell: ({ row }) => new Date(row.original.transaction_date).toLocaleDateString() },
        { id: "item", header: "Item", cell: ({ row }) => row.original.inventory_items?.name || "—" },
        {
            accessorKey: "transaction_type", header: "Type",
            cell: ({ row }) => (
                <Badge variant={row.original.transaction_type === "IN" ? "default" : "destructive"} className={row.original.transaction_type === "IN" ? "bg-green-600 hover:bg-green-700" : ""}>
                    {row.original.transaction_type === "IN" ? "▲ IN" : "▼ OUT"}
                </Badge>
            ),
        },
        { accessorKey: "quantity", header: "Qty" },
        { accessorKey: "reference_type", header: "Reference", cell: ({ row }) => row.original.reference_type || "—" },
        { accessorKey: "remarks", header: "Remarks", cell: ({ row }) => row.original.remarks || "—" },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div><h2 className="text-2xl font-semibold tracking-tight">Inventory Transactions</h2><p className="text-sm text-muted-foreground mt-1">Record stock IN/OUT and view audit trail.</p></div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Record Transaction</Button></SheetTrigger>
                    <SheetContent><SheetHeader><SheetTitle>Record Transaction</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Item</Label><Select value={form.item_id} onValueChange={(v) => setForm((f) => ({ ...f, item_id: v }))}><SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger><SelectContent>{items.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Type</Label><Select value={form.transaction_type} onValueChange={(v) => setForm((f) => ({ ...f, transaction_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TXN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} /></div>
                            <div><Label>Reference</Label><Select value={form.reference_type} onValueChange={(v) => setForm((f) => ({ ...f, reference_type: v }))}><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{REF_TYPES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
                            <div><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))} /></div>
                            <Button onClick={save}>Record</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card><CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent></Card>
        </div>
    )
}
