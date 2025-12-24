"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type LedgerViewEntry = {
    id: string
    transaction_date: string
    description: string
    reference_type: string | null
    debit_amount: number
    credit_amount: number
    balance: number
}

export function LedgerView() {
    const [data, setData] = useState<LedgerViewEntry[]>([])
    const [accounts, setAccounts] = useState<Array<{ id: string; account_code: string; account_name: string }>>([])
    const [selectedAccount, setSelectedAccount] = useState<string>("")
    const supabase = createClient()

    useEffect(() => {
        const fetchAccounts = async () => {
            const { data: accData } = await supabase
                .from("chart_of_accounts")
                .select("id, account_code, account_name")
                .eq("is_active", true)
                .order("account_code")
            
            if (accData) {
                setAccounts(accData)
                if (accData.length > 0) setSelectedAccount(accData[0].id)
            }
        }
        fetchAccounts()
    }, [supabase])

    useEffect(() => {
        if (selectedAccount) {
            fetchAccountLedger()
        }
    }, [selectedAccount])

    const fetchAccountLedger = async () => {
        const { data: ledgerData } = await supabase
            .from("general_ledger")
            .select("*")
            .eq("account_id", selectedAccount)
            .order("transaction_date", { ascending: true })
            .order("created_at", { ascending: true })

        if (ledgerData) setData(ledgerData)
    }

    const openingBalance = data.length > 0 ? data[0].balance - (data[0].debit_amount || 0) + (data[0].credit_amount || 0) : 0
    const closingBalance = data.length > 0 ? data[data.length - 1].balance : 0
    const totalDebit = data.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0)
    const totalCredit = data.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0)

    const selectedAccountName = accounts.find(a => a.id === selectedAccount)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Ledger View</CardTitle>
                <CardDescription>View detailed ledger for a specific account</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Select Account</Label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.account_code} - {acc.account_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedAccount && (
                        <>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Account</div>
                                    <div className="font-medium">
                                        {selectedAccountName?.account_code} - {selectedAccountName?.account_name}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Opening Balance</div>
                                    <div className="font-medium">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(openingBalance)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Closing Balance</div>
                                    <div className="font-medium">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(closingBalance)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Net Change</div>
                                    <div className="font-medium">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(closingBalance - openingBalance)}
                                    </div>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} className="font-medium">Opening Balance</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(openingBalance)}
                                        </TableCell>
                                    </TableRow>
                                    {data.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{new Date(entry.transaction_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell>{entry.reference_type || "-"}</TableCell>
                                            <TableCell className="text-right text-green-700">
                                                {entry.debit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                }).format(entry.debit_amount) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right text-red-700">
                                                {entry.credit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                }).format(entry.credit_amount) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                }).format(entry.balance)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold">
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(totalDebit)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(totalCredit)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(closingBalance)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

