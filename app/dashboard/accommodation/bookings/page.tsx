"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type Accommodation = { id: string; name: string; code: string }

type RoomOption = { id: string; code: string; name: string; room_type: string; base_price_per_night: number; accommodation_id: string }

type Booking = {
    id: string
    booking_code: string | null
    devotee_id: string | null
    room_id: string | null
    accommodation_id: string | null
    check_in_date: string
    check_out_date: string
    status: string
    number_of_guests: number
    total_amount: number
    payment_status: string | null
    special_requests: string | null
    devotee?: { first_name: string; last_name: string | null } | null
    room?: { name: string; code: string } | null
    accommodations?: { name: string; code: string } | null
}

export default function AccommodationBookingsPage() {
    const supabase = createClient()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [dateFrom, setDateFrom] = useState(() => new Date().toISOString().slice(0, 10))
    const [propertyFilter, setPropertyFilter] = useState<string>("all")
    const [open, setOpen] = useState(false)
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [rooms, setRooms] = useState<RoomOption[]>([])
    const [devotees, setDevotees] = useState<{ id: string; first_name: string; last_name: string | null }[]>([])
    const [form, setForm] = useState({
        accommodation_id: "",
        devotee_id: "",
        room_id: "",
        check_in_date: "",
        check_out_date: "",
        number_of_guests: 1,
        special_requests: "",
    })

    const fetchBookings = async () => {
        let q = supabase
            .from("accommodation_bookings")
            .select("id, booking_code, devotee_id, room_id, accommodation_id, check_in_date, check_out_date, status, number_of_guests, total_amount, payment_status, special_requests, devotees(first_name, last_name), rooms(name, code), accommodations(name, code)")
            .gte("check_out_date", dateFrom)
            .order("check_in_date")
        if (propertyFilter && propertyFilter !== "all") {
            q = q.eq("accommodation_id", propertyFilter)
        }
        const { data } = await q
        setBookings((data as Booking[]) || [])
    }

    useEffect(() => {
        fetchBookings()
    }, [dateFrom, propertyFilter])

    useEffect(() => {
        supabase.from("devotees").select("id, first_name, last_name").limit(200).then(({ data }) => setDevotees(data || []))
        supabase.from("accommodations").select("id, name, code").eq("is_active", true).order("code").then(({ data }) => setAccommodations((data as Accommodation[]) || []))
    }, [])

    useEffect(() => {
        if (!form.accommodation_id) {
            setRooms([])
            setForm((f) => ({ ...f, room_id: "" }))
            return
        }
        supabase
            .from("rooms")
            .select("id, code, name, room_type, base_price_per_night, accommodation_id")
            .eq("accommodation_id", form.accommodation_id)
            .eq("is_active", true)
            .order("code")
            .then(({ data }) => setRooms((data as RoomOption[]) || []))
    }, [form.accommodation_id])

    const createBooking = async () => {
        if (!form.check_in_date || !form.check_out_date) {
            toast.error("Check-in and check-out dates required")
            return
        }
        const room = rooms.find((r) => r.id === form.room_id)
        const nights = Math.ceil((new Date(form.check_out_date).getTime() - new Date(form.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
        const total = room ? room.base_price_per_night * nights : 0
        const { error } = await supabase.from("accommodation_bookings").insert({
            devotee_id: form.devotee_id || null,
            room_id: form.room_id || null,
            check_in_date: form.check_in_date,
            check_out_date: form.check_out_date,
            number_of_guests: form.number_of_guests,
            special_requests: form.special_requests.trim() || null,
            total_amount: total,
            status: "Confirmed",
            source: "admin",
        })
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success("Booking created")
        setOpen(false)
        setForm({ accommodation_id: "", devotee_id: "", room_id: "", check_in_date: "", check_out_date: "", number_of_guests: 1, special_requests: "" })
        fetchBookings()
    }

    const checkIn = async (b: Booking) => {
        await supabase.from("accommodation_bookings").update({ status: "CheckedIn", actual_check_in_at: new Date().toISOString() }).eq("id", b.id)
        fetchBookings()
        toast.success("Checked in")
    }

    const checkOut = async (b: Booking) => {
        await supabase.from("accommodation_bookings").update({ status: "CheckedOut", actual_check_out_at: new Date().toISOString() }).eq("id", b.id)
        fetchBookings()
        toast.success("Checked out")
    }

    const bookingColumns: ColumnDef<Booking>[] = [
        { accessorKey: "booking_code", header: "Code" },
        {
            accessorKey: "devotee",
            header: "Guest",
            cell: ({ row }) =>
                row.original.devotee
                    ? `${(row.original.devotee as { first_name: string; last_name: string | null }).first_name} ${(row.original.devotee as { first_name: string; last_name: string | null }).last_name || ""}`.trim()
                    : "-",
        },
        {
            accessorKey: "accommodations",
            header: "Property",
            cell: ({ row }) => (row.original.accommodations ? `${(row.original.accommodations as { name: string }).name}` : "-"),
        },
        { accessorKey: "room", header: "Room", cell: ({ row }) => (row.original.room ? (row.original.room as { name: string }).name : "-") },
        { accessorKey: "check_in_date", header: "Check-in" },
        { accessorKey: "check_out_date", header: "Check-out" },
        { accessorKey: "status", header: "Status" },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const b = row.original
                return (
                    <div className="flex gap-1">
                        {b.status === "Confirmed" && (
                            <Button size="sm" onClick={() => checkIn(b)}>
                                <LogIn className="h-4 w-4" />
                            </Button>
                        )}
                        {b.status === "CheckedIn" && (
                            <Button size="sm" variant="secondary" onClick={() => checkOut(b)}>
                                <LogOut className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )
            },
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Bookings</h2>
                    <p className="text-sm text-muted-foreground mt-1">Reservations and check-in/check-out.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
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
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Booking
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>New Booking</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 py-6">
                                <div>
                                    <Label>Property</Label>
                                    <Select value={form.accommodation_id} onValueChange={(v) => setForm((f) => ({ ...f, accommodation_id: v, room_id: "" }))}>
                                        <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                                        <SelectContent>
                                            {accommodations.map((a) => (
                                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Room (optional)</Label>
                                    <Select value={form.room_id} onValueChange={(v) => setForm((f) => ({ ...f, room_id: v }))} disabled={!form.accommodation_id}>
                                        <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                                        <SelectContent>
                                            {rooms.map((r) => (
                                                <SelectItem key={r.id} value={r.id}>{r.name} ({r.code}) - ₹{r.base_price_per_night}/night</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Devotee (optional)</Label>
                                    <Select value={form.devotee_id} onValueChange={(v) => setForm((f) => ({ ...f, devotee_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {devotees.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>{d.first_name} {d.last_name || ""}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Check-in</Label>
                                    <Input type="date" value={form.check_in_date} onChange={(e) => setForm((f) => ({ ...f, check_in_date: e.target.value }))} />
                                </div>
                                <div>
                                    <Label>Check-out</Label>
                                    <Input type="date" value={form.check_out_date} onChange={(e) => setForm((f) => ({ ...f, check_out_date: e.target.value }))} />
                                </div>
                                <div>
                                    <Label>Guests</Label>
                                    <Input type="number" min={1} value={form.number_of_guests} onChange={(e) => setForm((f) => ({ ...f, number_of_guests: parseInt(e.target.value, 10) || 1 }))} />
                                </div>
                                <div>
                                    <Label>Special requests</Label>
                                    <Input value={form.special_requests} onChange={(e) => setForm((f) => ({ ...f, special_requests: e.target.value }))} />
                                </div>
                                <Button onClick={createBooking}>Create Booking</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex gap-2 items-center">
                <Label>From date</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <Card>
                <CardContent className="pt-6">
                    <DataTable columns={bookingColumns} data={bookings} />
                </CardContent>
            </Card>
        </div>
    )
}
