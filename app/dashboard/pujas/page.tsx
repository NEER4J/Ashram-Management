"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { PujaBookingForm } from "./booking-form"
import { StatusBadge } from "@/components/ui/status-badge"

export type PujaBooking = {
    id: string
    booking_code: string
    puja_date: string
    puja_time: string
    status: string
    payment_status: string
    amount_paid: number
    devotees: {
        first_name: string
        last_name: string
    }
    master_pujas: {
        name: string
    }
}

export const columns: ColumnDef<PujaBooking>[] = [
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
]

export default function PujaBookingsPage() {
    const [data, setData] = useState<PujaBooking[]>([])
    const [isOpen, setIsOpen] = useState(false)
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

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Puja Bookings</h2>
                    <p className="text-muted-foreground">
                        Schedule and manage puja services.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Booking
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>New Puja Booking</SheetTitle>
                            <SheetDescription>
                                Schedule a new puja.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <PujaBookingForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
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
        </div>
    )
}
