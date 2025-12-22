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
import { DonationForm } from "./donation-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Donation = {
    id: string
    donation_code: string
    amount: number
    payment_mode: string
    payment_status: string
    donation_date: string
    devotee_id: string
    devotees: {
        first_name: string
        last_name: string
    }
}

export default function DonationsPage() {
    const [data, setData] = useState<Donation[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [donationToDelete, setDonationToDelete] = useState<Donation | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: donations, error } = await supabase
            .from("donations")
            .select(`
        *,
        devotees (
          first_name,
          last_name
        )
      `)
            .order("created_at", { ascending: false })

        if (donations) setData(donations)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (donation: Donation) => {
        setEditingDonation(donation)
        setIsOpen(true)
    }

    const handleDelete = (donation: Donation) => {
        setDonationToDelete(donation)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!donationToDelete) return

        const { error } = await supabase
            .from("donations")
            .delete()
            .eq("id", donationToDelete.id)

        if (error) {
            toast.error("Failed to delete donation")
        } else {
            toast.success("Donation deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setDonationToDelete(null)
    }

    const columns: ColumnDef<Donation>[] = [
        {
            accessorKey: "donation_code",
            header: "Donation ID",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("donation_code") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "donation_date",
            header: "Date",
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
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("amount"))
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "payment_mode",
            header: "Mode",
        },
        {
            accessorKey: "payment_status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("payment_status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const donation = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(donation)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(donation)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Donations</h2>
                    <p className="text-muted-foreground">
                        Track and manage temple donations and receipts.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingDonation(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Record Donation
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingDonation ? "Edit Donation" : "Record Donation"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingDonation
                                    ? "Update donation information here."
                                    : "Record a new donation entry. Receipt will be generated automatically."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <DonationForm
                                initialData={editingDonation || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingDonation(null)
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
                searchKey="donation_code"
                searchPlaceholder="Search by Donation ID, payment mode..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Donation</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this donation? This action cannot be undone.
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
