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
import { EventForm } from "./event-form"
import { StatusBadge } from "@/components/ui/status-badge"

export type TempleEvent = {
    id: string
    name: string
    type: string
    start_date: string
    end_date: string
    status: string
    budget: number
}

export const columns: ColumnDef<TempleEvent>[] = [
    {
        accessorKey: "name",
        header: "Event Name",
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        id: "dates",
        header: "Dates",
        cell: ({ row }) => `${row.original.start_date} to ${row.original.end_date}`
    },
    {
        accessorKey: "budget",
        header: "Budget",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("budget"))
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
]

export default function EventsPage() {
    const [data, setData] = useState<TempleEvent[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: events } = await supabase
            .from("temple_events")
            .select("*")
            .order("start_date", { ascending: true })

        if (events) setData(events)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Events Management</h2>
                    <p className="text-muted-foreground">
                        Plan and manage temple events and festivals.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Create New Event</SheetTitle>
                            <SheetDescription>
                                Add a new event to the calendar.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <EventForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="name"
                searchPlaceholder="Filter events..."
            />
        </div>
    )
}
