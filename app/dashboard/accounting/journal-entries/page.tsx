"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Eye } from "lucide-react"
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
import { JournalEntryForm } from "./journal-entry-form"
import { StatusBadge } from "@/components/ui/status-badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type JournalEntry = {
    id: string
    entry_number: string
    entry_date: string
    description: string | null
    status: string
    created_at: string
}

export default function JournalEntriesPage() {
    const [data, setData] = useState<JournalEntry[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<string | null>(null)
    const [entryLines, setEntryLines] = useState<any[]>([])
    const supabase = createClient()

    const fetchData = async () => {
        const { data: entries, error } = await supabase
            .from("journal_entries")
            .select("*")
            .order("entry_date", { ascending: false })
            .order("created_at", { ascending: false })

        if (entries) setData(entries)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const viewEntry = async (entryId: string) => {
        setSelectedEntry(entryId)
        const { data: lines } = await supabase
            .from("journal_entry_lines")
            .select(`
                *,
                account:chart_of_accounts (
                    account_code,
                    account_name
                )
            `)
            .eq("journal_entry_id", entryId)
            .order("line_number")

        if (lines) setEntryLines(lines)
        setViewDialogOpen(true)
    }

    const columns: ColumnDef<JournalEntry>[] = [
        {
            accessorKey: "entry_number",
            header: "Entry Number",
            cell: ({ row }) => (
                <div className="font-mono font-medium text-slate-900">
                    {row.getValue("entry_number") || "N/A"}
                </div>
            ),
        },
        {
            accessorKey: "entry_date",
            header: "Date",
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const entry = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewEntry(entry.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
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
                    <h2 className="text-3xl font-medium tracking-tight">Journal Entries</h2>
                    <p className="text-muted-foreground">
                        Create and manage manual accounting journal entries.
                    </p>
                </div>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                            <Plus className="mr-2 h-4 w-4" /> New Entry
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-2xl overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Create Journal Entry</SheetTitle>
                            <SheetDescription>
                                Create a new journal entry. Debits must equal credits.
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-6">
                            <JournalEntryForm
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
                searchKey="entry_number"
                searchPlaceholder="Search by entry number..."
            />
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Journal Entry Details</DialogTitle>
                        <DialogDescription>View journal entry line items</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entryLines.map((line) => (
                                    <TableRow key={line.id}>
                                        <TableCell>
                                            {line.account ? `${line.account.account_code} - ${line.account.account_name}` : "N/A"}
                                        </TableCell>
                                        <TableCell>{line.description || "-"}</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {line.debit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(line.debit_amount) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {line.credit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(line.credit_amount) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

