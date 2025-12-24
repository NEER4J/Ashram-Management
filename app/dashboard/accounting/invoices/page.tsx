"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, DollarSign } from "lucide-react"
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { InvoiceForm } from "./invoice-form"
import { InvoicePaymentForm } from "./invoice-payment-form"
import { StatusBadge } from "@/components/ui/status-badge"

export type Invoice = {
    id: string
    invoice_number: string | null
    devotee_id: string | null
    devotee: {
        first_name: string
        last_name: string | null
    } | null
    invoice_date: string
    due_date: string | null
    total_amount: number
    paid_amount: number
    payment_status: string
    gst_amount: number
}

export default function InvoicesPage() {
    const [data, setData] = useState<Invoice[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [invoiceForPayment, setInvoiceForPayment] = useState<Invoice | null>(null)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: invoices, error } = await supabase
            .from("invoices")
            .select(`
                *,
                devotee:devotees (
                    first_name,
                    last_name
                )
            `)
            .order("invoice_date", { ascending: false })

        if (invoices) setData(invoices)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice)
        setIsOpen(true)
    }

    const handlePayment = (invoice: Invoice) => {
        setInvoiceForPayment(invoice)
        setPaymentDialogOpen(true)
    }

    const columns: ColumnDef<Invoice>[] = [
        {
            accessorKey: "invoice_number",
            header: "Invoice Number",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("invoice_number") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "invoice_date",
            header: "Date",
        },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const d = row.original.devotee
                return d ? `${d.first_name} ${d.last_name || ""}` : "-"
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
                const invoice = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            {invoice.payment_status !== "Paid" && (
                                <DropdownMenuItem onClick={() => handlePayment(invoice)}>
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
                    <h2 className="text-3xl font-medium tracking-tight">Invoices (Accounts Receivable)</h2>
                    <p className="text-muted-foreground">
                        Manage customer invoices and track payments.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) setEditingInvoice(null)
                }}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Create Invoice
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>
                                {editingInvoice ? "Edit Invoice" : "Create Invoice"}
                            </SheetTitle>
                            <SheetDescription>
                                {editingInvoice
                                    ? "Update invoice information here."
                                    : "Create a new invoice for a devotee or customer."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <InvoiceForm
                                initialData={editingInvoice || undefined}
                                onSuccess={() => {
                                    setIsOpen(false)
                                    setEditingInvoice(null)
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
                searchKey="invoice_number"
                searchPlaceholder="Search by invoice number..."
            />
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Record Invoice Payment</DialogTitle>
                        <DialogDescription>
                            Record payment for this invoice
                        </DialogDescription>
                    </DialogHeader>
                    {invoiceForPayment && (
                        <InvoicePaymentForm
                            invoiceId={invoiceForPayment.id}
                            invoiceAmount={invoiceForPayment.total_amount}
                            paidAmount={invoiceForPayment.paid_amount || 0}
                            onSuccess={() => {
                                setPaymentDialogOpen(false)
                                setInvoiceForPayment(null)
                                fetchData()
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

