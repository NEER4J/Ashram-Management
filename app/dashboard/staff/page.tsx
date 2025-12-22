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
import { StaffForm } from "./staff-form"
import { Badge } from "@/components/ui/badge"

export type Staff = {
    id: string
    first_name: string
    last_name: string
    role: string
    mobile_number: string
    is_active: boolean
}

export const columns: ColumnDef<Staff>[] = [
    {
        accessorKey: "first_name",
        header: "Name",
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name || ""}`,
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        accessorKey: "mobile_number",
        header: "Mobile",
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
                {row.getValue("is_active") ? "Active" : "Inactive"}
            </Badge>
        ),
    },
]

export default function StaffPage() {
    const [data, setData] = useState<Staff[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const fetchData = async () => {
        const { data: staff } = await supabase
            .from("staff")
            .select("*")
            .order("first_name", { ascending: true })

        if (staff) setData(staff)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
                    <p className="text-muted-foreground">
                        Manage priests and other staff members.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Staff
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Add New Staff</SheetTitle>
                            <SheetDescription>
                                Create a new staff or priest profile.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <StaffForm onSuccess={() => { setIsOpen(false); fetchData(); }} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                data={data}
                columns={columns}
                searchKey="first_name"
                searchPlaceholder="Filter staff..."
            />
        </div>
    )
}
