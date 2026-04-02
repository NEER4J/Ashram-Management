"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Accommodation = { id: string; name: string; code: string }

type WaitlistEntry = {
    id: string
    desired_check_in: string
    desired_check_out: string
    room_type_preference: string | null
    notes: string | null
    created_at: string
    accommodation_id: string | null
    guest_name: string | null
    guest_phone: string | null
    guest_email: string | null
    devotee?: { first_name: string; last_name: string | null; mobile_number: string } | null
    accommodations?: { name: string; code: string } | null
}

export default function AccommodationWaitlistPage() {
    const supabase = createClient()
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [propertyFilter, setPropertyFilter] = useState<string>("all")

    const fetchWaitlist = async () => {
        let q = supabase
            .from("booking_waitlist")
            .select("id, guest_name, guest_phone, guest_email, desired_check_in, desired_check_out, room_type_preference, notes, created_at, accommodation_id, devotees(first_name, last_name, mobile_number), accommodations(name, code)")
            .order("created_at", { ascending: false })
        if (propertyFilter && propertyFilter !== "all") {
            q = q.eq("accommodation_id", propertyFilter)
        }
        const { data } = await q
        setWaitlist((data as WaitlistEntry[]) || [])
    }

    useEffect(() => {
        fetchWaitlist()
    }, [propertyFilter])

    useEffect(() => {
        supabase.from("accommodations").select("id, name, code").eq("is_active", true).order("code").then(({ data }) => setAccommodations((data as Accommodation[]) || []))
    }, [])

    const columns: ColumnDef<WaitlistEntry>[] = [
        {
            accessorKey: "guest_name",
            header: "Guest",
            cell: ({ row }) => {
                const r = row.original
                if (r.guest_name) return r.guest_name
                return r.devotee ? `${(r.devotee as { first_name: string; last_name: string | null }).first_name} ${(r.devotee as { first_name: string; last_name: string | null }).last_name || ""}`.trim() : "-"
            },
        },
        { accessorKey: "guest_phone", header: "Phone", cell: ({ row }) => row.original.guest_phone || (row.original.devotee as { mobile_number?: string })?.mobile_number || "-" },
        {
            accessorKey: "accommodations",
            header: "Property",
            cell: ({ row }) => (row.original.accommodations ? (row.original.accommodations as { name: string }).name : "-"),
        },
        { accessorKey: "desired_check_in", header: "From" },
        { accessorKey: "desired_check_out", header: "To" },
        { accessorKey: "room_type_preference", header: "Room type" },
        { accessorKey: "created_at", header: "Added", cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString() },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Waitlist</h2>
                    <p className="text-sm text-muted-foreground mt-1">Pending accommodation requests.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Label className="text-muted-foreground text-sm">Property</Label>
                    <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All properties</SelectItem>
                            {accommodations.map((a) => (
                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <DataTable columns={columns} data={waitlist} />
                </CardContent>
            </Card>
        </div>
    )
}
