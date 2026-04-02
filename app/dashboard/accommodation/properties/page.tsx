"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Plus, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Accommodation = {
    id: string
    name: string
    code: string
    address: string | null
    phone: string | null
    email: string | null
    check_in_time: string | null
    check_out_time: string | null
    is_active: boolean
    created_at: string
}

export default function AccommodationPropertiesPage() {
    const supabase = createClient()
    const [properties, setProperties] = useState<Accommodation[]>([])
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState<Accommodation | null>(null)
    const [form, setForm] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        email: "",
        check_in_time: "14:00",
        check_out_time: "11:00",
        is_active: true,
    })

    const fetchProperties = async () => {
        const { data } = await supabase.from("accommodations").select("*").order("code")
        setProperties((data as Accommodation[]) || [])
    }

    useEffect(() => {
        fetchProperties()
    }, [])

    const saveProperty = async () => {
        if (!form.name.trim() || !form.code.trim()) {
            toast.error("Name and code are required")
            return
        }
        const payload = {
            name: form.name.trim(),
            code: form.code.trim().toUpperCase(),
            address: form.address.trim() || null,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            check_in_time: form.check_in_time || null,
            check_out_time: form.check_out_time || null,
            is_active: form.is_active,
        }
        if (editing) {
            const { error } = await supabase.from("accommodations").update(payload).eq("id", editing.id)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Property updated")
        } else {
            const { error } = await supabase.from("accommodations").insert(payload)
            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Property added")
        }
        setOpen(false)
        setEditing(null)
        setForm({ name: "", code: "", address: "", phone: "", email: "", check_in_time: "14:00", check_out_time: "11:00", is_active: true })
        fetchProperties()
    }

    const columns: ColumnDef<Accommodation>[] = [
        { accessorKey: "code", header: "Code" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "address", header: "Address", cell: ({ row }) => row.original.address || "-" },
        {
            accessorKey: "check_in_time",
            header: "Check-in",
            cell: ({ row }) => row.original.check_in_time || "-",
        },
        {
            accessorKey: "check_out_time",
            header: "Check-out",
            cell: ({ row }) => row.original.check_out_time || "-",
        },
        {
            accessorKey: "is_active",
            header: "Active",
            cell: ({ row }) => row.original.is_active
                ? <Badge variant="default" className="bg-green-600 hover:bg-green-700">Active</Badge>
                : <Badge variant="secondary">Inactive</Badge>,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                const p = row.original
                                setEditing(p)
                                setForm({
                                    name: p.name,
                                    code: p.code,
                                    address: p.address || "",
                                    phone: p.phone || "",
                                    email: p.email || "",
                                    check_in_time: p.check_in_time || "14:00",
                                    check_out_time: p.check_out_time || "11:00",
                                    is_active: p.is_active,
                                })
                                setOpen(true)
                            }}
                        >
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/accommodation/rooms?accommodation=${row.original.id}`}>
                                View rooms
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Properties</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage accommodation properties (guest houses, buildings).</p>
                </div>
                <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null) }}>
                    <SheetTrigger asChild>
                        <Button onClick={() => setForm({ name: "", code: "", address: "", phone: "", email: "", check_in_time: "14:00", check_out_time: "11:00", is_active: true })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Property
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>{editing ? "Edit Property" : "Add Property"}</SheetTitle>
                        </SheetHeader>
                        <div className="space-y-4 py-6">
                            <div>
                                <Label>Name</Label>
                                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Guest House" />
                            </div>
                            <div>
                                <Label>Code</Label>
                                <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. MAIN" disabled={!!editing} />
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Optional" />
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Optional" />
                            </div>
                            <div>
                                <Label>Check-in time</Label>
                                <Input type="time" value={form.check_in_time} onChange={(e) => setForm((f) => ({ ...f, check_in_time: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Check-out time</Label>
                                <Input type="time" value={form.check_out_time} onChange={(e) => setForm((f) => ({ ...f, check_out_time: e.target.value }))} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="active" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                                <Label htmlFor="active">Active</Label>
                            </div>
                            <Button onClick={saveProperty}>Save</Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <DataTable columns={columns} data={properties} />
                </CardContent>
            </Card>
        </div>
    )
}
