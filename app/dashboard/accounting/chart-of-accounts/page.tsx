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
import { AccountForm } from "./account-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type ChartOfAccount = {
    id: string
    account_code: string
    account_name: string
    account_type: string
    parent_account_id: string | null
    is_gst_applicable: boolean
    gst_rate: number
    opening_balance: number
    current_balance: number
    is_active: boolean
    description: string | null
}

export default function ChartOfAccountsPage() {
    const [data, setData] = useState<ChartOfAccount[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: accounts, error } = await supabase
            .from("chart_of_accounts")
            .select("*")
            .order("account_code", { ascending: true })

        if (accounts) setData(accounts)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (account: ChartOfAccount) => {
        setEditingAccount(account)
        setIsOpen(true)
    }

    const handleDelete = (account: ChartOfAccount) => {
        setAccountToDelete(account)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!accountToDelete) return

        const { error } = await supabase
            .from("chart_of_accounts")
            .delete()
            .eq("id", accountToDelete.id)

        if (error) {
            toast.error("Failed to delete account")
        } else {
            toast.success("Account deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setAccountToDelete(null)
    }

    const columns: ColumnDef<ChartOfAccount>[] = [
        {
            accessorKey: "account_code",
            header: "Code",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("account_code")}
                </div>
            ),
        },
        {
            accessorKey: "account_name",
            header: "Account Name",
        },
        {
            accessorKey: "account_type",
            header: "Type",
            cell: ({ row }) => (
                <StatusBadge status={row.getValue("account_type")} />
            ),
        },
        {
            accessorKey: "current_balance",
            header: "Balance",
            cell: ({ row }) => {
                const balance = parseFloat(row.getValue("current_balance") || "0")
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(balance)
                return <div className="font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "is_gst_applicable",
            header: "GST",
            cell: ({ row }) => {
                const isGst = row.getValue("is_gst_applicable")
                const rate = row.original.gst_rate
                return isGst ? `${rate}%` : "-"
            },
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
                const account = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(account)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(account)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Chart of Accounts</h2>
                    <p className="text-muted-foreground">
                        Manage your accounting chart of accounts structure.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingAccount(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Account
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingAccount ? "Edit Account" : "Add Account"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingAccount
                                    ? "Update account information here."
                                    : "Create a new account in your chart of accounts."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <AccountForm
                                initialData={editingAccount || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingAccount(null)
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
                searchKey="account_name"
                searchPlaceholder="Search by account name or code..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this account? This action cannot be undone.
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
