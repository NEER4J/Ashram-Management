"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
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
import { Plus, MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

type Accommodation = { id: string; name: string; code: string }

type Room = {
    id: string
    code: string
    name: string
    room_type: string
    bed_count: number
    amenities: Record<string, unknown>
    building: string | null
    is_active: boolean
    base_price_per_night: number
    housekeeping_status: string | null
    accommodation_id: string
    accommodations?: Accommodation | null
}

const ROOM_TYPES = ["single", "double", "dormitory", "family_suite"]

const defaultForm = {
    accommodation_id: "",
    code: "",
    name: "",
    room_type: "single",
    bed_count: 1,
    building: "",
    base_price_per_night: 0,
    is_active: true,
    ac: false,
    fan: false,
    attached_bathroom: false,
    balcony: false,
}

export default function AccommodationRoomsPage() {
    const supabase = createClient()
    const searchParams = useSearchParams()
    const accommodationFromUrl = searchParams.get("accommodation")
    const [rooms, setRooms] = useState<Room[]>([])
    const [accommodations, setAccommodations] = useState<Accommodation[]>([])
    const [propertyFilter, setPropertyFilter] = useState<string>(accommodationFromUrl || "all")
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Room | null>(null)
    const [form, setForm] = useState(defaultForm)

    const fetchRooms = async () => {
        let q = supabase.from("rooms").select("*, accommodations(id, name, code)").order("code")
        if (propertyFilter && propertyFilter !== "all") {
            q = q.eq("accommodation_id", propertyFilter)
        }
        const { data } = await q
        setRooms((data as Room[]) || [])
    }

    useEffect(() => {
        supabase.from("accommodations").select("id, name, code").eq("is_active", true).order("code").then(({ data }) => setAccommodations((data as Accommodation[]) || []))
    }, [])

    useEffect(() => {
        if (accommodationFromUrl) setPropertyFilter(accommodationFromUrl)
    }, [accommodationFromUrl])

    useEffect(() => {
        fetchRooms()
    }, [propertyFilter])

    const saveRoom = async () => {
        if (!form.code.trim() || !form.name.trim()) {
            toast.error("Code and name required")
            return
        }
        if (!editing && !form.accommodation_id) {
            toast.error("Please select a property")
            return
        }
        const payload = {
            ...(editing ? {} : { accommodation_id: form.accommodation_id }),
            code: form.code.trim(),
            name: form.name.trim(),
            room_type: form.room_type,
            bed_count: form.bed_count,
            building: form.building.trim() || null,
            base_price_per_night: form.base_price_per_night,
            is_active: form.is_active,
            amenities: {
                ac: form.ac,
                fan: form.fan,
                attached_bathroom: form.attached_bathroom,
                balcony: form.balcony,
            },
        }
        if (editing) {
            const { error } = await supabase.from("rooms").update(payload).eq("id", editing.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Room updated")
        } else {
            const { error } = await supabase.from("rooms").insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Room added")
        }
        setOpen(false)
        setEditing(null)
        setForm(defaultForm)
        fetchRooms()
    }

    const columns: ColumnDef<Room>[] = [
        { accessorKey: "code", header: "Code" },
        { accessorKey: "name", header: "Name" },
        {
            id: "property",
            header: "Property",
            cell: ({ row }) => row.original.accommodations ? `${row.original.accommodations.name} (${row.original.accommodations.code})` : "-",
        },
        { accessorKey: "room_type", header: "Type", cell: ({ row }) => String(row.original.room_type) },
        { accessorKey: "bed_count", header: "Beds" },
        { accessorKey: "base_price_per_night", header: "Price/night", cell: ({ row }) => `₹${row.original.base_price_per_night}` },
        { accessorKey: "housekeeping_status", header: "Status", cell: ({ row }) => row.original.housekeeping_status || "-" },
        {
            id: "actions",
            cell: ({ row }) => {
                const r = row.original
                const am = (r.amenities || {}) as Record<string, unknown>
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditing(r)
                                    setForm({
                                        ...defaultForm,
                                        accommodation_id: r.accommodation_id,
                                        code: r.code,
                                        name: r.name,
                                        room_type: r.room_type,
                                        bed_count: r.bed_count,
                                        building: r.building || "",
                                        base_price_per_night: r.base_price_per_night,
                                        is_active: r.is_active,
                                        ac: am?.ac === true,
                                        fan: am?.fan === true,
                                        attached_bathroom: am?.attached_bathroom === true,
                                        balcony: am?.balcony === true,
                                    })
                                    setOpen(true)
                                }}
                            >
                                Edit
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Rooms</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage room inventory and amenities by property.</p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    <Label className="text-muted-foreground text-sm">Property</Label>
                    <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All properties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All properties</SelectItem>
                            {accommodations.map((a) => (
                                <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/accommodation/bookings">Bookings</Link>
                    </Button>
                    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
                        <SheetTrigger asChild>
                            <Button onClick={() => setForm(defaultForm)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Room
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>{editing ? "Edit Room" : "Add Room"}</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-4 py-6">
                                {!editing && (
                                    <div>
                                        <Label>Property</Label>
                                        <Select value={form.accommodation_id} onValueChange={(v) => setForm((f) => ({ ...f, accommodation_id: v }))}>
                                            <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                                            <SelectContent>
                                                {accommodations.map((a) => (
                                                    <SelectItem key={a.id} value={a.id}>{a.name} ({a.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                <div>
                                    <Label>Code</Label>
                                    <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="e.g. R101" disabled={!!editing} />
                                </div>
                                <div>
                                    <Label>Name</Label>
                                    <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Room name" />
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <Select value={form.room_type} onValueChange={(v) => setForm((f) => ({ ...f, room_type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Bed count</Label>
                                    <Input type="number" min={1} value={form.bed_count} onChange={(e) => setForm((f) => ({ ...f, bed_count: parseInt(e.target.value, 10) || 1 }))} />
                                </div>
                                <div>
                                    <Label>Building</Label>
                                    <Input value={form.building} onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} />
                                </div>
                                <div>
                                    <Label>Price per night (₹)</Label>
                                    <Input type="number" min={0} value={form.base_price_per_night} onChange={(e) => setForm((f) => ({ ...f, base_price_per_night: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.ac} onChange={(e) => setForm((f) => ({ ...f, ac: e.target.checked }))} /> AC</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.fan} onChange={(e) => setForm((f) => ({ ...f, fan: e.target.checked }))} /> Fan</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.attached_bathroom} onChange={(e) => setForm((f) => ({ ...f, attached_bathroom: e.target.checked }))} /> Attached bathroom</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" checked={form.balcony} onChange={(e) => setForm((f) => ({ ...f, balcony: e.target.checked }))} /> Balcony</label>
                                </div>
                                {editing && (
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                                        <Label htmlFor="active">Active</Label>
                                    </div>
                                )}
                                <Button onClick={saveRoom}>Save</Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <DataTable columns={columns} data={rooms} />
                </CardContent>
            </Card>
        </div>
    )
}
