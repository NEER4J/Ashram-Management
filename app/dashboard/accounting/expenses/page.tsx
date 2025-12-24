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
import { ExpenseForm } from "./expense-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Expense = {
    id: string
    expense_number: string | null
    expense_date: string
    expense_category_id: string
    category: {
        account_code: string
        account_name: string
    }
    vendor_id: string | null
    vendor: {
        name: string
    } | null
    total_amount: number
    payment_status: string
    gst_amount: number
}

export default function ExpensesPage() {
    const [data, setData] = useState<Expense[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: expenses, error } = await supabase
            .from("expenses")
            .select(`
                *,
                category:chart_of_accounts (
                    account_code,
                    account_name
                ),
                vendor:vendors (
                    name
                )
            `)
            .order("expense_date", { ascending: false })

        if (expenses) setData(expenses)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense)
        setIsOpen(true)
    }

    const handleDelete = (expense: Expense) => {
        setExpenseToDelete(expense)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!expenseToDelete) return

        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", expenseToDelete.id)

        if (error) {
            toast.error("Failed to delete expense")
        } else {
            toast.success("Expense deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setExpenseToDelete(null)
    }

    const columns: ColumnDef<Expense>[] = [
        {
            accessorKey: "expense_number",
            header: "Expense Number",
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("expense_number") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "expense_date",
            header: "Date",
        },
        {
            id: "category",
            header: "Category",
            cell: ({ row }) => {
                const cat = row.original.category
                return cat ? `${cat.account_code} - ${cat.account_name}` : "N/A"
            }
        },
        {
            id: "vendor",
            header: "Vendor",
            cell: ({ row }) => {
                const v = row.original.vendor
                return v ? v.name : "-"
            }
        },
        {
            accessorKey: "total_amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"))
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
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
                const expense = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(expense)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(expense)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Expenses</h2>
                    <p className="text-muted-foreground">
                        Track and manage expenses with GST support.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingExpense(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingExpense ? "Edit Expense" : "Add Expense"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingExpense
                                    ? "Update expense information here."
                                    : "Record a new expense entry."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <ExpenseForm
                                initialData={editingExpense || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingExpense(null)
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
                searchKey="expense_number"
                searchPlaceholder="Search by expense number..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Expense</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this expense? This action cannot be undone.
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

