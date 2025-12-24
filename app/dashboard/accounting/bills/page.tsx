"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, DollarSign } from "lucide-react"
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
import { BillForm } from "./bill-form"
import { BillPaymentForm } from "./bill-payment-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"

export type Bill = {
    id: string
    bill_number: string | null
    vendor_id: string
    vendor: {
        name: string
    }
    bill_date: string
    due_date: string | null
    total_amount: number
    paid_amount: number
    payment_status: string
    gst_amount: number
}

export default function BillsPage() {
    const [data, setData] = useState<Bill[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [editingBill, setEditingBill] = useState<Bill | null>(null)
    const [billForPayment, setBillForPayment] = useState<Bill | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: bills, error } = await supabase
            .from("bills")
            .select(`
                *,
                vendor:vendors (
                    name
                )
            `)
            .order("bill_date", { ascending: false })

        if (bills) setData(bills)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (bill: Bill) => {
        setEditingBill(bill)
        setIsOpen(true)
    }

    const handlePayment = (bill: Bill) => {
        setBillForPayment(bill)
        setPaymentDialogOpen(true)
    }

    const columns: ColumnDef<Bill>[] = [
        {
            accessorKey: "bill_number",
            header: "Bill Number",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("bill_number") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "bill_date",
            header: "Date",
        },
        {
            id: "vendor",
            header: "Vendor",
            cell: ({ row }) => {
                const v = row.original.vendor
                return v ? v.name : "Unknown"
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
            accessorKey: "paid_amount",
            header: "Paid",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("paid_amount") || "0")
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div>{formatted}</div>
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
                const bill = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(bill)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            {bill.payment_status !== "Paid" && (
                                <DropdownMenuItem onClick={() => handlePayment(bill)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Record Payment
                                </DropdownMenuItem>
                            )}
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
                    <h2 className="text-3xl font-medium tracking-tight">Bills (Accounts Payable)</h2>
                    <p className="text-muted-foreground">
                        Manage vendor bills and track payments.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingBill(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Bill
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingBill ? "Edit Bill" : "Add Bill"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingBill
                                    ? "Update bill information here."
                                    : "Record a new vendor bill."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <BillForm
                                initialData={editingBill || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingBill(null)
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
                searchKey="bill_number"
                searchPlaceholder="Search by bill number or vendor..."
            />
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Record Bill Payment</DialogTitle>
                        <DialogDescription>
                            Record payment for this bill
                        </DialogDescription>
                    </DialogHeader>
                    {billForPayment && (
                        <BillPaymentForm
                            billId={billForPayment.id}
                            billAmount={billForPayment.total_amount}
                            paidAmount={billForPayment.paid_amount || 0}
                            onSuccess={() => {
                                setPaymentDialogOpen(false)
                                setBillForPayment(null)
                                fetchData()
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

