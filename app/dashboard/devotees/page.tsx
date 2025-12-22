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
import { DevoteeForm } from "./devotee-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Devotee = {
    id: string
    first_name: string
    last_name: string
    mobile_number: string
    email: string
    membership_type: string
    membership_status: string
}

export default function DevoteesPage() {
    const [data, setData] = useState<Devotee[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingDevotee, setEditingDevotee] = useState<Devotee | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [devoteeToDelete, setDevoteeToDelete] = useState<Devotee | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: devotees, error } = await supabase
            .from("devotees")
            .select("*")
            .order("created_at", { ascending: false })

        if (devotees) setData(devotees)
    }

    useEffect(() => {
        fetchData()
    }, [])

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

    const columns: ColumnDef<Devotee>[] = [
        {
            accessorKey: "first_name",
            header: "Name",
            cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ""}`,
        },
        {
            accessorKey: "mobile_number",
            header: "Mobile",
        },
        {
            accessorKey: "email",
            header: "Email",
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
            <DataTable
                data={data}
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
