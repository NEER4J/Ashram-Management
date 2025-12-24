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
import { VendorForm } from "./vendor-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Vendor = {
    id: string
    vendor_code: string | null
    name: string
    gstin: string | null
    phone: string | null
    email: string | null
    is_active: boolean
}

export default function VendorsPage() {
    const [data, setData] = useState<Vendor[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: vendors, error } = await supabase
            .from("vendors")
            .select("*")
            .order("name", { ascending: true })

        if (vendors) setData(vendors)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor)
        setIsOpen(true)
    }

    const handleDelete = (vendor: Vendor) => {
        setVendorToDelete(vendor)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!vendorToDelete) return

        const { error } = await supabase
            .from("vendors")
            .delete()
            .eq("id", vendorToDelete.id)

        if (error) {
            toast.error("Failed to delete vendor")
        } else {
            toast.success("Vendor deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setVendorToDelete(null)
    }

    const columns: ColumnDef<Vendor>[] = [
        {
            accessorKey: "vendor_code",
            header: "Code",
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("vendor_code") || "-"}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Vendor Name",
        },
        {
            accessorKey: "gstin",
            header: "GSTIN",
            cell: ({ row }) => row.getValue("gstin") || "-",
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.getValue("phone") || "-",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.getValue("email") || "-",
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }) => (
                <StatusBadge status={row.getValue("is_active") ? "Active" : "Inactive"} />
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const vendor = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(vendor)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Vendors</h2>
                    <p className="text-muted-foreground">
                        Manage vendor and supplier information.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingVendor(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Vendor
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingVendor ? "Edit Vendor" : "Add Vendor"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingVendor
                                    ? "Update vendor information here."
                                    : "Add a new vendor to your system."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <VendorForm
                                initialData={editingVendor || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingVendor(null)
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
                searchPlaceholder="Search by vendor name..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vendor</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this vendor? This action cannot be undone.
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

