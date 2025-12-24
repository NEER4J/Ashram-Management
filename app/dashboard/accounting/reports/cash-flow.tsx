"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CashFlowPage() {
    const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [cashInflows, setCashInflows] = useState<any[]>([])
    const [cashOutflows, setCashOutflows] = useState<any[]>([])
    const supabase = createClient()

    const fetchReport = async () => {
        // Get cash account
        const { data: cashAccount } = await supabase
            .from("chart_of_accounts")
            .select("id")
            .eq("account_code", "1000")
            .maybeSingle()

        if (cashAccount) {
            // Get all cash inflows (debits to cash)
            const { data: inflows } = await supabase
                .from("general_ledger")
                .select("debit_amount, description, transaction_date, reference_type")
                .eq("account_id", cashAccount.id)
                .gte("transaction_date", startDate)
                .lte("transaction_date", endDate)
                .gt("debit_amount", 0)
                .order("transaction_date", { ascending: false })

            if (inflows) setCashInflows(inflows)

            // Get all cash outflows (credits to cash)
            const { data: outflows } = await supabase
                .from("general_ledger")
                .select("credit_amount, description, transaction_date, reference_type")
                .eq("account_id", cashAccount.id)
                .gte("transaction_date", startDate)
                .lte("transaction_date", endDate)
                .gt("credit_amount", 0)
                .order("transaction_date", { ascending: false })

            if (outflows) setCashOutflows(outflows)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [startDate, endDate])

    const totalInflows = cashInflows.reduce((sum, item) => sum + (item.debit_amount || 0), 0)
    const totalOutflows = cashOutflows.reduce((sum, item) => sum + (item.credit_amount || 0), 0)
    const netCashFlow = totalInflows - totalOutflows

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Cash Flow Statement</h2>
                <p className="text-muted-foreground">
                    View cash inflows and outflows for a selected period.
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

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cash Inflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashInflows.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{new Date(item.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(item.debit_amount || 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold">
                                    <TableCell colSpan={2}>Total Inflows</TableCell>
                                    <TableCell className="text-right text-green-700">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(totalInflows)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cash Outflows</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashOutflows.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{new Date(item.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(item.credit_amount || 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold">
                                    <TableCell colSpan={2}>Total Outflows</TableCell>
                                    <TableCell className="text-right text-red-700">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(totalOutflows)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Net Cash Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-center" style={{ color: netCashFlow >= 0 ? "#16a34a" : "#dc2626" }}>
                        {new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                        }).format(netCashFlow)}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

