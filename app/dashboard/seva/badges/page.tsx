"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { toast } from "sonner"

type Badge = {
    id: string
    volunteer_id: string
    badge_type: string
    awarded_at: string
    volunteers: { devotees: { first_name: string; last_name: string } | null } | null
}

const BADGE_TYPES = ["First Seva", "50 Hours", "100 Hours", "250 Hours", "500 Hours", "1000 Hours", "Festival Hero", "Kitchen Champion", "Event Star", "Community Leader", "Dedication Award", "Outstanding Service"]

export default function BadgesPage() {
    const supabase = createClient()
    const [data, setData] = useState<Badge[]>([])
    const [volunteers, setVolunteers] = useState<{ id: string; devotees: { first_name: string; last_name: string } | null }[]>([])
    const [open, setOpen] = useState(false)
    const [form, setForm] = useState({ volunteer_id: "", badge_type: "First Seva" })

    const fetchData = async () => {
        const { data: badges } = await supabase.from("volunteer_badges").select("*, volunteers(devotees(first_name, last_name))").order("awarded_at", { ascending: false })
        setData((badges as Badge[]) || [])
    }

    const fetchVolunteers = async () => {
        const { data } = await supabase.from("volunteers").select("id, devotees(first_name, last_name)").order("created_at")
        setVolunteers(data || [])
    }

    useEffect(() => { fetchData(); fetchVolunteers() }, [])

    const award = async () => {
        if (!form.volunteer_id) { toast.error("Select a volunteer"); return }
        const { error } = await supabase.from("volunteer_badges").insert({ volunteer_id: form.volunteer_id, badge_type: form.badge_type })
        if (error) { toast.error(error.message); return }
        toast.success("Badge awarded!")
        setOpen(false)
        setForm({ volunteer_id: "", badge_type: "First Seva" })
        fetchData()
    }

    const columns: ColumnDef<Badge>[] = [
        {
            id: "volunteer",
            header: "Volunteer",
            cell: ({ row }) => {
                const d = row.original.volunteers?.devotees
                return d ? `${d.first_name} ${d.last_name || ""}`.trim() : "—"
            },
        },
        { accessorKey: "badge_type", header: "Badge" },
        {
            accessorKey: "awarded_at",
            header: "Awarded",
            cell: ({ row }) => new Date(row.original.awarded_at).toLocaleDateString(),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Volunteer Badges</h2>
                    <p className="text-sm text-muted-foreground mt-1">Recognize and reward volunteer achievements.</p>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Award Badge</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader><SheetTitle>Award Badge</SheetTitle></SheetHeader>
                        <div className="space-y-4 py-6">
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
                            <div>
                                <Label>Badge Type</Label>
                                <Select value={form.badge_type} onValueChange={(v) => setForm((f) => ({ ...f, badge_type: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BADGE_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={award}>Award Badge</Button>
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
