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
import { DonationForm } from "./donation-form"
import { StatusBadge } from "@/components/ui/status-badge"

export type Donation = {
    id: string
    donation_code: string
    amount: number
    payment_mode: string
    payment_status: string
    donation_date: string
    devotees: {
        first_name: string
        last_name: string
    }
}

export const columns: ColumnDef<Donation>[] = [
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
]

export default function DonationsPage() {
    const [data, setData] = useState<Donation[]>([])
    const [isOpen, setIsOpen] = useState(false)
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

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Donations</h2>
                    <p className="text-muted-foreground">
                        Track and manage temple donations and receipts.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Record Donation
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Record Donation</SheetTitle>
                            <SheetDescription>
                                Record a new donation entry. Receipt will be generated automatically.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <DonationForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="payment_mode"
                searchPlaceholder="Filter..."
            />
        </div>
    )
}
