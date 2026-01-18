"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, FileDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { DevoteeForm } from "./devotee-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Devotee = {
    id: string
    first_name: string
    last_name: string | null
    mobile_number: string
    email: string | null
    date_of_birth: string | null
    occupation: string | null
    city: string | null
    state: string | null
    event_source: string | null
    devotee_code: string | null
    membership_type: string
    membership_status: string
    created_at: string
}

export default function DevoteesPage() {
    const [data, setData] = useState<Devotee[]>([])
    const [filteredData, setFilteredData] = useState<Devotee[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingDevotee, setEditingDevotee] = useState<Devotee | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [devoteeToDelete, setDevoteeToDelete] = useState<Devotee | null>(null)
    const [selectedEventSource, setSelectedEventSource] = useState<string>("all")
    const [eventSources, setEventSources] = useState<{ value: string; label: string }[]>([])
    const supabase = createClient()

    const fetchData = async () => {
        const { data: devotees, error } = await supabase
            .from("devotees")
            .select("id, first_name, last_name, mobile_number, email, date_of_birth, occupation, city, state, event_source, devotee_code, membership_type, membership_status, created_at")
            .order("created_at", { ascending: false })

        if (devotees) {
            setData(devotees as Devotee[])
            setFilteredData(devotees as Devotee[])
        }
    }

    const fetchEventSources = async () => {
        // Get unique event sources from devotees
        const { data: devotees, error } = await supabase
            .from("devotees")
            .select("event_source")
            .not("event_source", "is", null)

        if (devotees) {
            const uniqueSources = Array.from(new Set(devotees.map(d => d.event_source).filter(Boolean)))
            
            // Fetch event names for these slugs
            if (uniqueSources.length > 0) {
                const { data: events } = await supabase
                    .from("temple_events")
                    .select("slug, name")
                    .in("slug", uniqueSources)

                const eventMap = new Map(events?.map(e => [e.slug, e.name]) || [])
                
                const sources = uniqueSources.map(source => ({
                    value: source as string,
                    label: eventMap.get(source as string) || source as string
                })).sort((a, b) => a.label.localeCompare(b.label))

                setEventSources(sources)
            }
        }
    }

    useEffect(() => {
        fetchData()
        fetchEventSources()
    }, [])

    useEffect(() => {
        if (selectedEventSource === "all") {
            setFilteredData(data)
        } else {
            setFilteredData(data.filter(d => d.event_source === selectedEventSource))
        }
    }, [selectedEventSource, data])

    const handleEdit = (devotee: Devotee) => {
        setEditingDevotee(devotee)
        setIsOpen(true)
    }

    const handleDelete = (devotee: Devotee) => {
        setDevoteeToDelete(devotee)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!devoteeToDelete) return

        const { error } = await supabase
            .from("devotees")
            .delete()
            .eq("id", devoteeToDelete.id)

        if (error) {
            toast.error("Failed to delete devotee")
        } else {
            toast.success("Devotee deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setDevoteeToDelete(null)
    }

    const exportToCSV = () => {
        if (filteredData.length === 0) {
            toast.error("No devotees to export")
            return
        }

        // Define CSV headers
        const headers = [
            "Devotee Code",
            "First Name",
            "Last Name",
            "Mobile Number",
            "Email",
            "Date of Birth",
            "Occupation",
            "City",
            "State",
            "Event Source",
            "Membership Type",
            "Membership Status",
            "Created At"
        ]

        // Convert data to CSV rows
        const csvRows = filteredData.map(devotee => [
            devotee.devotee_code || "",
            devotee.first_name || "",
            devotee.last_name || "",
            devotee.mobile_number || "",
            devotee.email || "",
            devotee.date_of_birth ? new Date(devotee.date_of_birth).toLocaleDateString() : "",
            devotee.occupation || "",
            devotee.city || "",
            devotee.state || "",
            devotee.event_source || "",
            devotee.membership_type || "",
            devotee.membership_status || "",
            new Date(devotee.created_at).toLocaleString()
        ])

        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...csvRows.map(row => row.map(cell => {
                // Escape commas and quotes in cell values
                const cellValue = String(cell || "")
                if (cellValue.includes(",") || cellValue.includes('"') || cellValue.includes("\n")) {
                    return `"${cellValue.replace(/"/g, '""')}"`
                }
                return cellValue
            }).join(","))
        ].join("\n")

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        const filterLabel = selectedEventSource === "all" ? "all" : eventSources.find(e => e.value === selectedEventSource)?.label || selectedEventSource
        link.setAttribute("download", `devotees-${filterLabel.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("CSV exported successfully")
    }

    const columns: ColumnDef<Devotee>[] = [
        {
            accessorKey: "devotee_code",
            header: "Devotee Code",
            cell: ({ row }) => row.original.devotee_code || "-",
        },
        {
            accessorKey: "first_name",
            header: "Name",
            cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ""}`.trim(),
        },
        {
            accessorKey: "mobile_number",
            header: "Mobile",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || "-",
        },
        {
            accessorKey: "event_source",
            header: "Event Source",
            cell: ({ row }) => {
                const source = row.original.event_source
                if (!source) return "-"
                const eventName = eventSources.find(e => e.value === source)?.label
                return eventName || source
            },
        },
        {
            accessorKey: "membership_type",
            header: "Membership",
        },
        {
            accessorKey: "membership_status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("membership_status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const devotee = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(devotee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(devotee)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Devotee Management</h2>
                    <p className="text-muted-foreground">
                        Manage your devotee database, memberships, and profiles.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={exportToCSV} variant="outline" disabled={filteredData.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Sheet open={isOpen} onOpenChange={(open) => {
                        setIsOpen(open)
                        if (!open) setEditingDevotee(null)
                    }}>
                        <SheetTrigger asChild>
                            <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                                <Plus className="mr-2 h-4 w-4" /> Add Devotee
                            </Button>
                        </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingDevotee ? "Edit Devotee" : "Add New Devotee"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingDevotee
                                    ? "Update devotee information here. Click save when you're done."
                                    : "Create a new devotee profile here. Click save when you're done."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <DevoteeForm
                                initialData={editingDevotee || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingDevotee(null)
                                    fetchData()
                                }}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="event-filter" className="text-sm font-medium">
                        Filter by Event:
                    </label>
                    <Select value={selectedEventSource} onValueChange={setSelectedEventSource}>
                        <SelectTrigger id="event-filter" className="w-[250px]">
                            <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Devotees ({data.length})</SelectItem>
                            <SelectItem value="none">No Event Source ({data.filter(d => !d.event_source).length})</SelectItem>
                            {eventSources.map((source) => {
                                const count = data.filter(d => d.event_source === source.value).length
                                return (
                                    <SelectItem key={source.value} value={source.value}>
                                        {source.label} ({count})
                                    </SelectItem>
                                )
                            })}
                        </SelectContent>
                    </Select>
                </div>
                {selectedEventSource !== "all" && (
                    <p className="text-sm text-muted-foreground">
                        Showing {filteredData.length} of {data.length} devotees
                    </p>
                )}
            </div>
            <DataTable
                data={filteredData}
                columns={columns}
                searchKey="first_name"
                searchPlaceholder="Filter devotees..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Devotee</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {devoteeToDelete?.first_name}{" "}
                            {devoteeToDelete?.last_name}? This action cannot be undone.
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
