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
import { DevoteeForm } from "./devotee-form"
import { StatusBadge } from "@/components/ui/status-badge"

export type Devotee = {
    id: string
    first_name: string
    last_name: string
    mobile_number: string
    email: string
    membership_type: string
    membership_status: string
}

export const columns: ColumnDef<Devotee>[] = [
    {
        accessorKey: "first_name",
        header: "Name",
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ""}`,
    },
    {
        accessorKey: "mobile_number",
        header: "Mobile",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "membership_type",
        header: "Membership",
    },
    {
        accessorKey: "membership_status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("membership_status")} />,
    },
]

export default function DevoteesPage() {
    const [data, setData] = useState<Devotee[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: devotees, error } = await supabase
            .from("devotees")
            .select("*")
            .order("created_at", { ascending: false })

        if (devotees) setData(devotees)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Devotee Management</h2>
                    <p className="text-muted-foreground">
                        Manage your devotee database, memberships, and profiles.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Devotee
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Add New Devotee</SheetTitle>
                            <SheetDescription>
                                Create a new devotee profile here. Click save when you're done.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <DevoteeForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="first_name"
                searchPlaceholder="Filter devotees..."
            />
        </div>
    )
}
