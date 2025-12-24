"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TrialBalancePage() {
    const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [accounts, setAccounts] = useState<any[]>([])
    const supabase = createClient()

    const fetchReport = async () => {
        const { data: allAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name, account_type, current_balance")
            .eq("is_active", true)
            .order("account_code")

        if (allAccounts) {
            setAccounts(allAccounts)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [asOfDate])

    const getDebitCredit = (account: any) => {
        const balance = account.current_balance || 0
        if (account.account_type === "Asset" || account.account_type === "Expense") {
            return { debit: balance, credit: 0 }
        } else {
            return { debit: 0, credit: Math.abs(balance) }
        }
    }

    const totalDebit = accounts.reduce((sum, acc) => sum + getDebitCredit(acc).debit, 0)
    const totalCredit = accounts.reduce((sum, acc) => sum + getDebitCredit(acc).credit, 0)

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Trial Balance</h2>
                <p className="text-muted-foreground">
                    View all account balances as of a specific date.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>As of Date</Label>
                        <Input
                            type="date"
                            value={asOfDate}
                            onChange={(e) => setAsOfDate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Trial Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account Code</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map((account) => {
                                const { debit, credit } = getDebitCredit(account)
                                return (
                                    <TableRow key={account.id}>
                                        <TableCell className="font-mono">{account.account_code}</TableCell>
                                        <TableCell>{account.account_name}</TableCell>
                                        <TableCell>{account.account_type}</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {debit > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(debit) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {credit > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(credit) : "-"}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
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
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

