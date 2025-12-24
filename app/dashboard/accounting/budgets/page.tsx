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
import { BudgetForm } from "./budget-form"
import { toast } from "sonner"

export type Budget = {
    id: string
    financial_year: string
    account_id: string
    account: {
        account_code: string
        account_name: string
        account_type: string
    }
    budgeted_amount: number
    actual_amount: number
}

export default function BudgetsPage() {
    const [data, setData] = useState<Budget[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: budgets, error } = await supabase
            .from("budgets")
            .select(`
                *,
                account:chart_of_accounts (
                    account_code,
                    account_name,
                    account_type
                )
            `)
            .order("financial_year", { ascending: false })
            .order("account_code", { ascending: true })

        if (budgets) setData(budgets)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget)
        setIsOpen(true)
    }

    const handleDelete = (budget: Budget) => {
        setBudgetToDelete(budget)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!budgetToDelete) return

        const { error } = await supabase
            .from("budgets")
            .delete()
            .eq("id", budgetToDelete.id)

        if (error) {
            toast.error("Failed to delete budget")
        } else {
            toast.success("Budget deleted successfully")
            fetchData()
        }

        setDeleteDialogOpen(false)
        setBudgetToDelete(null)
    }

    const columns: ColumnDef<Budget>[] = [
        {
            accessorKey: "financial_year",
            header: "Financial Year",
        },
        {
            id: "account",
            header: "Account",
            cell: ({ row }) => {
                const acc = row.original.account
                return acc ? `${acc.account_code} - ${acc.account_name}` : "N/A"
            }
        },
        {
            accessorKey: "budgeted_amount",
            header: "Budgeted",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("budgeted_amount"))
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div className="font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "actual_amount",
            header: "Actual",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("actual_amount") || "0")
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div>{formatted}</div>
            },
        },
        {
            id: "variance",
            header: "Variance",
            cell: ({ row }) => {
                const budgeted = parseFloat(row.getValue("budgeted_amount"))
                const actual = parseFloat(row.getValue("actual_amount") || "0")
                const variance = budgeted - actual
                const variancePercent = budgeted > 0 ? ((variance / budgeted) * 100).toFixed(1) : "0"
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(variance)
                return (
                    <div className={variance < 0 ? "text-red-600" : "text-green-600"}>
                        {formatted} ({variancePercent}%)
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const budget = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDelete(budget)}
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
                    <h2 className="text-3xl font-medium tracking-tight">Budgets</h2>
                    <p className="text-muted-foreground">
                        Set and track budgets for income and expense accounts.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingBudget(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Budget
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingBudget ? "Edit Budget" : "Add Budget"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingBudget
                                    ? "Update budget information here."
                                    : "Set a budget for an income or expense account."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <BudgetForm
                                initialData={editingBudget || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingBudget(null)
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
                searchKey="financial_year"
                searchPlaceholder="Search by financial year or account..."
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Budget</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this budget? This action cannot be undone.
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

