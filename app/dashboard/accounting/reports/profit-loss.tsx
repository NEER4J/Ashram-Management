"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ProfitLossPage() {
    const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [income, setIncome] = useState<any[]>([])
    const [expenses, setExpenses] = useState<any[]>([])
    const supabase = createClient()

    const fetchReport = async () => {
        // Fetch income accounts
        const { data: incomeAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name")
            .eq("account_type", "Income")
            .eq("is_active", true)
            .order("account_code")

        if (incomeAccounts) {
            const incomeData = await Promise.all(
                incomeAccounts.map(async (account) => {
                    const { data: entries } = await supabase
                        .from("general_ledger")
                        .select("credit_amount")
                        .eq("account_id", account.id)
                        .gte("transaction_date", startDate)
                        .lte("transaction_date", endDate)

                    const total = entries?.reduce((sum, e) => sum + (e.credit_amount || 0), 0) || 0
                    return { ...account, total }
                })
            )
            setIncome(incomeData)
        }

        // Fetch expense accounts
        const { data: expenseAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name")
            .eq("account_type", "Expense")
            .eq("is_active", true)
            .order("account_code")

        if (expenseAccounts) {
            const expenseData = await Promise.all(
                expenseAccounts.map(async (account) => {
                    const { data: entries } = await supabase
                        .from("general_ledger")
                        .select("debit_amount")
                        .eq("account_id", account.id)
                        .gte("transaction_date", startDate)
                        .lte("transaction_date", endDate)

                    const total = entries?.reduce((sum, e) => sum + (e.debit_amount || 0), 0) || 0
                    return { ...account, total }
                })
            )
            setExpenses(expenseData)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [startDate, endDate])

    const totalIncome = income.reduce((sum, item) => sum + item.total, 0)
    const totalExpenses = expenses.reduce((sum, item) => sum + item.total, 0)
    const netProfit = totalIncome - totalExpenses

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Profit & Loss Statement</h2>
                <p className="text-muted-foreground">
                    View income and expenses for a selected period.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
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
                    <CardTitle>Income</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {income.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.account_code} - {item.account_name}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold">
                                <TableCell>Total Income</TableCell>
                                <TableCell className="text-right text-green-700">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalIncome)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.account_code} - {item.account_name}</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.total)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold">
                                <TableCell>Total Expenses</TableCell>
                                <TableCell className="text-right text-red-700">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalExpenses)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Net Profit / Loss</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-center" style={{ color: netProfit >= 0 ? "#16a34a" : "#dc2626" }}>
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(netProfit)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

