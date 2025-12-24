"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, RefreshCw } from "lucide-react"
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
import { BankAccountForm } from "./bank-account-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"
import Link from "next/link"

export type BankAccount = {
    id: string
    account_name: string
    account_number: string | null
    bank_name: string
    ifsc_code: string | null
    account_type: string
    current_balance: number
    is_active: boolean
}

export default function BankAccountsPage() {
    const [data, setData] = useState<BankAccount[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: accounts, error } = await supabase
            .from("bank_accounts")
            .select("*")
            .order("account_name", { ascending: true })

        if (accounts) setData(accounts)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account)
        setIsOpen(true)
    }

    const handleDelete = (account: BankAccount) => {
        setAccountToDelete(account)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!accountToDelete) return

        const { error } = await supabase
            .from("bank_accounts")
            .delete()
            .eq("id", accountToDelete.id)

        if (error) {
            toast.error("Failed to delete bank account")
        } else {
            toast.success("Bank account deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setAccountToDelete(null)
    }

    const columns: ColumnDef<BankAccount>[] = [
        {
            accessorKey: "account_name",
            header: "Account Name",
        },
        {
            accessorKey: "bank_name",
            header: "Bank",
        },
        {
            accessorKey: "account_number",
            header: "Account Number",
            cell: ({ row }) => row.getValue("account_number") || "-",
        },
        {
            accessorKey: "account_type",
            header: "Type",
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
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/accounting/bank-accounts/reconciliation?account=${account.id}`}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reconcile
                                </Link>
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
                    <h2 className="text-3xl font-medium tracking-tight">Bank Accounts</h2>
                    <p className="text-muted-foreground">
                        Manage bank accounts and perform reconciliation.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingAccount(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingAccount
                                    ? "Update bank account information here."
                                    : "Add a new bank account to your system."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <BankAccountForm
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
                searchPlaceholder="Search by account name or bank..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Bank Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bank account? This action cannot be undone.
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

