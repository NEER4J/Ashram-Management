"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { GSTReturnForm } from "./gst-return-form"

export type GSTReturn = {
    id: string
    return_period: string
    return_type: string
    filing_date: string | null
    taxable_value: number
    total_tax_amount: number
    status: string
}

export default function GSTPage() {
    const [data, setData] = useState<GSTReturn[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: returns, error } = await supabase
            .from("gst_returns")
            .select("*")
            .order("return_period", { ascending: false })

        if (returns) setData(returns)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const columns: ColumnDef<GSTReturn>[] = [
        {
            accessorKey: "return_period",
            header: "Period",
        },
        {
            accessorKey: "return_type",
            header: "Return Type",
        },
        {
            accessorKey: "filing_date",
            header: "Filing Date",
            cell: ({ row }) => {
                const date = row.getValue("filing_date")
                return date ? new Date(date as string).toLocaleDateString() : "-"
            },
        },
        {
            accessorKey: "taxable_value",
            header: "Taxable Value",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("taxable_value") || "0")
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
            },
        },
        {
            accessorKey: "total_tax_amount",
            header: "Total Tax",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("total_tax_amount") || "0")
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
    ]

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight">GST Management</h2>
                    <p className="text-muted-foreground">
                        Manage GST returns and filing records.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> Add GST Return
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Add GST Return</SheetTitle>
                            <SheetDescription>
                                Record GST return filing information.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <GSTReturnForm
                                onSuccess={() => {
                                    setIsOpen(false)
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
                searchKey="return_period"
                searchPlaceholder="Search by period..."
            />
        </div>
    )
}

