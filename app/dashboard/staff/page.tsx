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
import { StaffForm } from "./staff-form"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export type Staff = {
    id: string
    first_name: string
    last_name: string
    role: string
    mobile_number: string
    is_active: boolean
}

export default function StaffPage() {
    const [data, setData] = useState<Staff[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("*")
            .order("first_name", { ascending: true })

        if (staff) setData(staff)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (staff: Staff) => {
        setEditingStaff(staff)
        setIsOpen(true)
    }

    const handleDelete = (staff: Staff) => {
        setStaffToDelete(staff)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!staffToDelete) return

        const { error } = await supabase
            .from("staff")
            .delete()
            .eq("id", staffToDelete.id)

        if (error) {
            toast.error("Failed to delete staff")
        } else {
            toast.success("Staff deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setStaffToDelete(null)
    }

    const columns: ColumnDef<Staff>[] = [
        {
            accessorKey: "first_name",
            header: "Name",
            cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ""}`,
        },
        {
            accessorKey: "role",
            header: "Role",
        },
        {
            accessorKey: "mobile_number",
            header: "Mobile",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
                    {row.getValue("is_active") ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const staff = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(staff)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(staff)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Staff Management</h2>
                    <p className="text-muted-foreground">
                        Manage pandit ji and other staff members.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingStaff(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Staff
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingStaff ? "Edit Staff" : "Add New Staff"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingStaff
                                    ? "Update staff information here."
                                    : "Create a new staff or pandit ji profile."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <StaffForm
                                initialData={editingStaff || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingStaff(null)
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
                searchPlaceholder="Filter staff..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Staff</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {staffToDelete?.first_name}{" "}
                            {staffToDelete?.last_name}? This action cannot be undone.
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
