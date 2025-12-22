"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PujaBookingForm } from "./booking-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type PujaBooking = {
    id: string
    booking_code: string
    puja_date: string
    puja_time: string
    status: string
    payment_status: string
    amount_paid: number
    devotee_id: string
    puja_id: string
    devotees: {
        first_name: string
        last_name: string
    }
    master_pujas: {
        name: string
    }
}

export default function PujaBookingsPage() {
    const [data, setData] = useState<PujaBooking[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingBooking, setEditingBooking] = useState<PujaBooking | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [bookingToDelete, setBookingToDelete] = useState<PujaBooking | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: bookings } = await supabase
            .from("puja_bookings")
            .select(`
        *,
        devotees ( first_name, last_name ),
        master_pujas ( name )
      `)
            .order("puja_date", { ascending: false })

        if (bookings) setData(bookings)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (booking: PujaBooking) => {
        setEditingBooking(booking)
        setIsOpen(true)
    }

    const handleDelete = (booking: PujaBooking) => {
        setBookingToDelete(booking)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!bookingToDelete) return

        const { error } = await supabase
            .from("puja_bookings")
            .delete()
            .eq("id", bookingToDelete.id)

        if (error) {
            toast.error("Failed to delete booking")
        } else {
            toast.success("Booking deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setBookingToDelete(null)
    }

    const columns: ColumnDef<PujaBooking>[] = [
        {
            header: "Date & Time",
            accessorFn: (row) => `${row.puja_date} ${row.puja_time || ""}`,
        },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const d = row.original.devotees
                return d ? `${d.first_name} ${d.last_name || ""}` : "Unknown"
            }
        },
        {
            id: "puja",
            header: "Puja",
            cell: ({ row }) => row.original.master_pujas?.name || "Unknown"
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "payment_status",
            header: "Payment",
            cell: ({ row }) => <StatusBadge status={row.getValue("payment_status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const booking = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(booking)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(booking)}
                                className="text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight">Puja Bookings</h2>
                    <p className="text-muted-foreground">
                        Schedule and manage puja services.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingBooking(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> New Booking
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingBooking ? "Edit Puja Booking" : "New Puja Booking"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingBooking
                                    ? "Update puja booking information here."
                                    : "Schedule a new puja."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <PujaBookingForm
                                initialData={editingBooking || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingBooking(null)
                                    fetchData()
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="status"
                searchPlaceholder="Filter status..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this puja booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
