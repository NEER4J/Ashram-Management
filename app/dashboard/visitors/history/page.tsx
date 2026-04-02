"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Download } from "lucide-react"
import { toast } from "sonner"

type Visitor = {
    id: string
    name: string
    phone: string
    email: string | null
    visit_purpose: string | null
    visit_date: string
    check_in_at: string | null
    check_out_at: string | null
    visitor_pass_code: string | null
    is_vip: boolean
    nationality: string | null
}

export default function VisitorHistoryPage() {
    const supabase = createClient()
    const [data, setData] = useState<Visitor[]>([])
    const [search, setSearch] = useState("")
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const fetchData = async () => {
        let query = supabase.from("visitor_registrations").select("id, name, phone, email, visit_purpose, visit_date, check_in_at, check_out_at, visitor_pass_code, is_vip, nationality").order("visit_date", { ascending: false }).order("created_at", { ascending: false }).limit(500)
        if (dateFrom) query = query.gte("visit_date", dateFrom)
        if (dateTo) query = query.lte("visit_date", dateTo)
        if (search.trim()) {
            query = query.or(`name.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%`)
        }
        const { data: visitors } = await query
        setData((visitors as Visitor[]) || [])
    }

    useEffect(() => { fetchData() }, [dateFrom, dateTo])

    const handleSearch = () => { fetchData() }

    const exportCSV = () => {
        if (data.length === 0) { toast.error("No data to export"); return }
        const headers = ["Date", "Pass", "Name", "Phone", "Purpose", "Check-in", "Check-out", "VIP", "Nationality"]
        const rows = data.map((v) => [
            v.visit_date,
            v.visitor_pass_code || "",
            v.name,
            v.phone,
            v.visit_purpose || "",
            v.check_in_at ? new Date(v.check_in_at).toLocaleTimeString() : "",
            v.check_out_at ? new Date(v.check_out_at).toLocaleTimeString() : "",
            v.is_vip ? "Yes" : "No",
            v.nationality || "",
        ])
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `visitors-${dateFrom || "all"}-to-${dateTo || "now"}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const columns: ColumnDef<Visitor>[] = [
        { accessorKey: "visit_date", header: "Date" },
        { accessorKey: "visitor_pass_code", header: "Pass", cell: ({ row }) => row.original.visitor_pass_code || "—" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "phone", header: "Phone" },
        { accessorKey: "visit_purpose", header: "Purpose", cell: ({ row }) => row.original.visit_purpose || "—" },
        { accessorKey: "check_in_at", header: "In", cell: ({ row }) => row.original.check_in_at ? new Date(row.original.check_in_at).toLocaleTimeString() : "—" },
        { accessorKey: "check_out_at", header: "Out", cell: ({ row }) => row.original.check_out_at ? new Date(row.original.check_out_at).toLocaleTimeString() : "—" },
        { accessorKey: "is_vip", header: "VIP", cell: ({ row }) => row.original.is_vip ? <Star className="h-4 w-4 text-amber-500" /> : null },
        { accessorKey: "nationality", header: "Nationality", cell: ({ row }) => row.original.nationality || "—" },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Visitor History</h2>
                    <p className="text-sm text-muted-foreground mt-1">Search and browse all past visits.</p>
                </div>
                <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
                <div>
                    <Label>Search (name or phone)</Label>
                    <div className="flex gap-2">
                        <Input className="w-64" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter name or phone..." onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>
                </div>
                <div>
                    <Label>From</Label>
                    <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                    <Label>To</Label>
                    <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <Button variant="outline" onClick={() => { setSearch(""); setDateFrom(""); setDateTo("") }}>Clear</Button>
            </div>
            <Card>
                <CardContent className="pt-6"><DataTable columns={columns} data={data} /></CardContent>
            </Card>
        </div>
    )
}
