"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function GSTReportsPage() {
    const [startDate, setStartDate] = useState<string>(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [gstData, setGstData] = useState<any[]>([])
    const supabase = createClient()

    const fetchReport = async () => {
        // Get all GST applicable transactions
        const { data: transactions } = await supabase
            .from("general_ledger")
            .select("*")
            .eq("gst_applicable", true)
            .gte("transaction_date", startDate)
            .lte("transaction_date", endDate)
            .order("transaction_date", { ascending: false })

        if (transactions) {
            // Group by GST rate
            const grouped = transactions.reduce((acc: any, trans) => {
                const rate = trans.gst_rate || 0
                if (!acc[rate]) {
                    acc[rate] = {
                        rate,
                        taxableValue: 0,
                        cgst: 0,
                        sgst: 0,
                        igst: 0,
                        totalTax: 0,
                    }
                }
                const taxable = (trans.debit_amount || 0) + (trans.credit_amount || 0) - (trans.gst_amount || 0)
                acc[rate].taxableValue += taxable
                acc[rate].totalTax += trans.gst_amount || 0
                // Assuming CGST/SGST split (can be customized)
                acc[rate].cgst += (trans.gst_amount || 0) / 2
                acc[rate].sgst += (trans.gst_amount || 0) / 2
                return acc
            }, {})

            setGstData(Object.values(grouped))
        }
    }

    useEffect(() => {
        fetchReport()
    }, [startDate, endDate])

    const totalTaxable = gstData.reduce((sum, item) => sum + item.taxableValue, 0)
    const totalCGST = gstData.reduce((sum, item) => sum + item.cgst, 0)
    const totalSGST = gstData.reduce((sum, item) => sum + item.sgst, 0)
    const totalIGST = gstData.reduce((sum, item) => sum + item.igst, 0)
    const totalTax = gstData.reduce((sum, item) => sum + item.totalTax, 0)

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">GST Reports</h2>
                <p className="text-muted-foreground">
                    View GST summary and tax calculations.
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
                    <CardTitle>GST Summary by Rate</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GST Rate (%)</TableHead>
                                <TableHead className="text-right">Taxable Value</TableHead>
                                <TableHead className="text-right">CGST</TableHead>
                                <TableHead className="text-right">SGST</TableHead>
                                <TableHead className="text-right">IGST</TableHead>
                                <TableHead className="text-right">Total Tax</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gstData.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.rate}%</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.taxableValue)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.cgst)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.sgst)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.igst)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(item.totalTax)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-bold">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalTaxable)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalCGST)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalSGST)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalIGST)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(totalTax)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

