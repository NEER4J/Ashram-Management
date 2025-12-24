"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type GeneralLedgerEntry = {
    id: string
    transaction_date: string
    account_id: string
    account: {
        account_code: string
        account_name: string
    }
    reference_type: string | null
    reference_id: string | null
    description: string
    debit_amount: number
    credit_amount: number
    balance: number
    gst_amount: number
}

export default function GeneralLedgerPage() {
    const [data, setData] = useState<GeneralLedgerEntry[]>([])
    const [accounts, setAccounts] = useState<Array<{ id: string; account_code: string; account_name: string }>>([])
    const [selectedAccount, setSelectedAccount] = useState<string>("all")
    const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const supabase = createClient()

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data: accData } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name")
                .eq("is_active", true)
                .order("account_code")
            
            if (accData) setAccounts(accData)
        }
        fetchAccounts()
    }, [supabase])

    useEffect(() => {
        fetchLedgerData()
    }, [selectedAccount, startDate, endDate])

    const fetchLedgerData = async () => {
        let query = supabase
            .from("general_ledger")
            .select(`
                *,
                account:chart_of_accounts (
                    account_code,
                    account_name
                )
            `)
            .gte("transaction_date", startDate)
            .lte("transaction_date", endDate)
            .order("transaction_date", { ascending: false })
            .order("created_at", { ascending: false })

        if (selectedAccount !== "all") {
            query = query.eq("account_id", selectedAccount)
        }

        const { data: ledgerData } = await query

        if (ledgerData) setData(ledgerData)
    }

    const columns: ColumnDef<GeneralLedgerEntry>[] = [
        {
            accessorKey: "transaction_date",
            header: "Date",
        },
        {
            id: "account",
            header: "Account",
            cell: ({ row }) => {
                const acc = row.original.account
                return acc ? `${acc.account_code} - ${acc.account_name}` : "N/A"
            },
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "reference_type",
            header: "Reference",
            cell: ({ row }) => {
                const refType = row.getValue("reference_type")
                return refType || "-"
            },
        },
        {
            accessorKey: "debit_amount",
            header: "Debit",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("debit_amount") || "0")
                if (amount === 0) return "-"
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div className="font-medium text-green-700">{formatted}</div>
            },
        },
        {
            accessorKey: "credit_amount",
            header: "Credit",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("credit_amount") || "0")
                if (amount === 0) return "-"
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount)
                return <div className="font-medium text-red-700">{formatted}</div>
            },
        },
        {
            accessorKey: "balance",
            header: "Balance",
            cell: ({ row }) => {
                const balance = parseFloat(row.getValue("balance") || "0")
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(balance)
                return <div className="font-medium">{formatted}</div>
            },
        },
    ]

    const totalDebit = data.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
    const totalCredit = data.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">General Ledger</h2>
                <p className="text-muted-foreground">
                    View all accounting transactions and entries.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter ledger entries by account and date range</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.account_code} - {acc.account_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Debit</div>
                            <div className="text-2xl font-bold text-green-700">
                                {new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                }).format(totalDebit)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Credit</div>
                            <div className="text-2xl font-bold text-red-700">
                                {new Intl.NumberFormat("en-IN", {
                                    style: "currency",
                                    currency: "INR",
                                }).format(totalCredit)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DataTable
                data={data}
                columns={columns}
                searchKey="description"
                searchPlaceholder="Search by description..."
            />
        </div>
    )
}

