"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, BarChart3, ExternalLink } from "lucide-react"
import Link from "next/link"
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
import { EventForm } from "./event-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type TempleEvent = {
    id: string
    name: string
    slug: string | null
    type: string
    start_date: string
    end_date: string
    status: string
    city: string | null
    state: string | null
    is_published: boolean
}

export default function EventsPage() {
    const [data, setData] = useState<TempleEvent[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<TempleEvent | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [eventToDelete, setEventToDelete] = useState<TempleEvent | null>(null)
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

    const handleEdit = (event: TempleEvent) => {
        setEditingEvent(event)
        setIsOpen(true)
    }

    const handleDelete = (event: TempleEvent) => {
        setEventToDelete(event)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!eventToDelete) return

        const { error } = await supabase
            .from("temple_events")
            .delete()
            .eq("id", eventToDelete.id)

        if (error) {
            toast.error("Failed to delete event")
        } else {
            toast.success("Event deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setEventToDelete(null)
    }

    const columns: ColumnDef<TempleEvent>[] = [
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "is_published",
            header: "Published",
            cell: ({ row }) => (
                <div className={row.getValue("is_published") ? "text-green-600 font-semibold" : "text-gray-400"}>
                    {row.getValue("is_published") ? "Yes" : "No"}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const event = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/events/${event.id}/analytics`}>
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Analytics
                                </Link>
                            </DropdownMenuItem>
                            {event.slug && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Public Page
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEdit(event)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(event)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Events Management</h2>
                    <p className="text-muted-foreground">
                        Plan and manage temple events and festivals.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingEvent(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingEvent ? "Edit Event" : "Create New Event"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingEvent
                                    ? "Update event information here."
                                    : "Add a new event to the calendar."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <EventForm
                                initialData={editingEvent ? {
                                    id: editingEvent.id,
                                    name: editingEvent.name,
                                    slug: editingEvent.slug || undefined,
                                    type: editingEvent.type || undefined,
                                    start_date: editingEvent.start_date,
                                    end_date: editingEvent.end_date,
                                    city: editingEvent.city || undefined,
                                    state: editingEvent.state || undefined,
                                    description: undefined,
                                    status: editingEvent.status as any,
                                    is_published: editingEvent.is_published ?? false,
                                } : undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingEvent(null)
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
                searchKey="name"
                searchPlaceholder="Filter events..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Event</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
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
