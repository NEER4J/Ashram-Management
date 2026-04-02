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
import { Plus, Check } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/ui/status-badge"

type MealToken = {
    id: string
    token_code: string
    meal_date: string
    meal_type: string
    devotee_id: string | null
    issued_at: string
    redeemed_at: string | null
    devotees: { first_name: string; last_name: string } | null
}

const MEAL_TYPES = ["breakfast", "lunch", "dinner"]

export default function MealTokensPage() {
    const supabase = createClient()
    const [data, setData] = useState<MealToken[]>([])
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string }[]>([])
    const [open, setOpen] = useState(false)
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
    const [form, setForm] = useState({ meal_date: new Date().toISOString().slice(0, 10), meal_type: "lunch", devotee_id: "" })

    const fetchData = async () => {
        let query = supabase.from("meal_tokens").select("*, devotees(first_name, last_name)").order("issued_at", { ascending: false })
        if (dateFilter) query = query.eq("meal_date", dateFilter)
        const { data: tokens } = await query
        setData((tokens as MealToken[]) || [])
    }

    const fetchDevotees = async () => {
        const { data } = await supabase.from("devotees").select("id, first_name, last_name").order("first_name").limit(200)
        setDevotees(data || [])
    }

    useEffect(() => { fetchData(); fetchDevotees() }, [dateFilter])

    const issueToken = async () => {
        if (!form.meal_date) { toast.error("Date required"); return }
        const payload: any = {
            meal_date: form.meal_date,
            meal_type: form.meal_type,
        }
        if (form.devotee_id) payload.devotee_id = form.devotee_id
        const { error } = await supabase.from("meal_tokens").insert(payload)
        if (error) { toast.error(error.message); return }
        toast.success("Token issued")
        setOpen(false)
        setForm({ meal_date: new Date().toISOString().slice(0, 10), meal_type: "lunch", devotee_id: "" })
        fetchData()
    }

    const redeemToken = async (id: string) => {
        const { error } = await supabase.from("meal_tokens").update({ redeemed_at: new Date().toISOString() }).eq("id", id)
        if (error) { toast.error(error.message); return }
        toast.success("Token redeemed")
        fetchData()
    }

    const columns: ColumnDef<MealToken>[] = [
        { accessorKey: "token_code", header: "Token Code" },
        { accessorKey: "meal_date", header: "Date" },
        { accessorKey: "meal_type", header: "Meal", cell: ({ row }) => <span className="capitalize">{row.original.meal_type}</span> },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "Walk-in"
            },
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.redeemed_at ? "Redeemed" : "Issued"} />,
        },
        {
            id: "actions",
            cell: ({ row }) => !row.original.redeemed_at ? (
                <Button size="sm" variant="outline" onClick={() => redeemToken(row.original.id)}>
                    <Check className="mr-1 h-3 w-3" /> Redeem
                </Button>
            ) : null,
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Meal Tokens</h2>
                    <p className="text-sm text-muted-foreground mt-1">Issue and track meal tokens for devotees and visitors.</p>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Issue Token</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Issue Meal Token</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
                            <div><Label>Meal Date</Label><Input type="date" value={form.meal_date} onChange={(e) => setForm((f) => ({ ...f, meal_date: e.target.value }))} /></div>
                            <div>
                                <Label>Meal Type</Label>
                                <Select value={form.meal_type} onValueChange={(v) => setForm((f) => ({ ...f, meal_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {MEAL_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Devotee (optional)</Label>
                                <Select value={form.devotee_id} onValueChange={(v) => setForm((f) => ({ ...f, devotee_id: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Walk-in (no devotee)" /></SelectTrigger>
                                    <SelectContent>
                                        {devotees.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name || ""}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={issueToken}>Issue Token</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex gap-4 items-center">
                <Label>Filter by date</Label>
                <Input type="date" className="w-48" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>All dates</Button>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
