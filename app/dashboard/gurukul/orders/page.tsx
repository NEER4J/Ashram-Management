"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
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
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

export type Order = {
    id: string
    order_code: string | null
    devotee_id: string | null
    order_date: string
    total_amount: number
    payment_status: string
    payment_mode: string | null
    transaction_ref: string | null
    delivery_status: string
    devotees: {
        first_name: string
        last_name: string | null
        mobile_number: string | null
    } | null
    order_items: {
        id: string
        material_id: string | null
        quantity: number
        unit_price: number
        total_price: number
        item_type: string
        study_materials: {
            title: string
            type: string
        } | null
    }[]
}

export default function OrdersPage() {
    const [data, setData] = useState<Order[]>([])
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)
    const [statusDialogOpen, setStatusDialogOpen] = useState(false)
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [newPaymentStatus, setNewPaymentStatus] = useState("")
    const [newDeliveryStatus, setNewDeliveryStatus] = useState("")
    const supabase = createClient()
    const router = useRouter()

    const fetchData = async () => {
        try {
            const { data: orders, error } = await supabase
                .from("study_material_orders")
                .select(`
                    *,
                    devotees (
                        first_name,
                        last_name,
                        mobile_number
                    ),
                    order_items (
                        id,
                        material_id,
                        quantity,
                        unit_price,
                        total_price,
                        item_type,
                        study_materials (
                            title,
                            type
                        )
                    )
                `)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching orders:", error)
                toast.error(`Failed to fetch orders: ${error.message}`)
                return
            }

            if (orders) {
                setData(orders)
            } else {
                setData([])
            }
        } catch (error) {
            console.error("Unexpected error fetching orders:", error)
            toast.error("An unexpected error occurred")
        }
    }

    useEffect(() => {
        fetchData()
    }, [supabase])

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order)
        setNewPaymentStatus(order.payment_status)
        setNewDeliveryStatus(order.delivery_status)
        setDetailDialogOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return

        setUpdatingStatus(true)
        try {
            const { error } = await supabase
                .from("study_material_orders")
                .update({
                    payment_status: newPaymentStatus,
                    delivery_status: newDeliveryStatus,
                })
                .eq("id", selectedOrder.id)

            if (error) throw error

            toast.success("Order status updated")
            setStatusDialogOpen(false)
            fetchData()
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Failed to update order status")
        } finally {
            setUpdatingStatus(false)
        }
    }

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "order_code",
            header: "Order Code",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("order_code") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "order_date",
            header: "Date",
        },
        {
            id: "devotee",
            header: "Devotee",
            cell: ({ row }) => {
                const devotee = row.original.devotees
                return devotee
                    ? `${devotee.first_name} ${devotee.last_name || ""}`
                    : "Unknown"
            },
        },
        {
            accessorKey: "total_amount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_amount"))
                return (
                    <div className="font-medium">
                        ₹{new Intl.NumberFormat("en-IN").format(amount)}
                    </div>
                )
            },
        },
        {
            accessorKey: "payment_status",
            header: "Payment",
            cell: ({ row }) => <StatusBadge status={row.getValue("payment_status")} />,
        },
        {
            accessorKey: "delivery_status",
            header: "Delivery",
            cell: ({ row }) => <StatusBadge status={row.getValue("delivery_status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const order = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedOrder(order)
                                    setNewPaymentStatus(order.payment_status)
                                    setNewDeliveryStatus(order.delivery_status)
                                    setStatusDialogOpen(true)
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
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
                    <h2 className="text-3xl font-medium tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">
                        Track and manage study material purchases and course enrollments.
                    </p>
                </div>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="order_code"
                searchPlaceholder="Search by order code..."
            />

            {/* Order Details Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                            Order Code: {selectedOrder?.order_code}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Order Date</p>
                                    <p className="text-sm">{selectedOrder.order_date}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Amount</p>
                                    <p className="text-sm font-semibold">
                                        ₹{new Intl.NumberFormat("en-IN").format(selectedOrder.total_amount)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Payment Status</p>
                                    <StatusBadge status={selectedOrder.payment_status} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Delivery Status</p>
                                    <StatusBadge status={selectedOrder.delivery_status} />
                                </div>
                                {selectedOrder.payment_mode && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Payment Mode</p>
                                        <p className="text-sm">{selectedOrder.payment_mode}</p>
                                    </div>
                                )}
                                {selectedOrder.transaction_ref && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-600">Transaction Ref</p>
                                        <p className="text-sm">{selectedOrder.transaction_ref}</p>
                                    </div>
                                )}
                            </div>

                            {selectedOrder.devotees && (
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-2">Devotee</p>
                                    <p className="text-sm">
                                        {selectedOrder.devotees.first_name} {selectedOrder.devotees.last_name || ""}
                                        {selectedOrder.devotees.mobile_number && (
                                            <span className="text-slate-500"> - {selectedOrder.devotees.mobile_number}</span>
                                        )}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-2">Order Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.order_items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.study_materials?.title || "Unknown Item"}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {item.item_type} • Qty: {item.quantity} • ₹{item.unit_price} each
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                ₹{new Intl.NumberFormat("en-IN").format(item.total_price)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDetailDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                            Update payment and delivery status for this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Payment Status</label>
                            <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                    <SelectItem value="Refunded">Refunded</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Delivery Status</label>
                            <Select value={newDeliveryStatus} onValueChange={setNewDeliveryStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Shipped">Shipped</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setStatusDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updatingStatus}
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                        >
                            {updatingStatus ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

