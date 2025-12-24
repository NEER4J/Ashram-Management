"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function BalanceSheetPage() {
    const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [assets, setAssets] = useState<any[]>([])
    const [liabilities, setLiabilities] = useState<any[]>([])
    const [equity, setEquity] = useState<any[]>([])
    const supabase = createClient()

    const fetchReport = async () => {
        // Fetch assets
        const { data: assetAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name, current_balance")
            .eq("account_type", "Asset")
            .eq("is_active", true)
            .order("account_code")

        if (assetAccounts) {
            setAssets(assetAccounts)
        }

        // Fetch liabilities
        const { data: liabilityAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name, current_balance")
            .eq("account_type", "Liability")
            .eq("is_active", true)
            .order("account_code")

        if (liabilityAccounts) {
            setLiabilities(liabilityAccounts)
        }

        // Fetch equity
        const { data: equityAccounts } = await supabase
            .from("chart_of_accounts")
            .select("id, account_code, account_name, current_balance")
            .eq("account_type", "Equity")
            .eq("is_active", true)
            .order("account_code")

        if (equityAccounts) {
            setEquity(equityAccounts)
        }
    }

    useEffect(() => {
        fetchReport()
    }, [asOfDate])

    const totalAssets = assets.reduce((sum, item) => sum + (item.current_balance || 0), 0)
    const totalLiabilities = liabilities.reduce((sum, item) => sum + (item.current_balance || 0), 0)
    const totalEquity = equity.reduce((sum, item) => sum + (item.current_balance || 0), 0)
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Balance Sheet</h2>
                <p className="text-muted-foreground">
                    View assets, liabilities, and equity as of a specific date.
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

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.account_code} - {item.account_name}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(item.current_balance || 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold">
                                    <TableCell>Total Assets</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(totalAssets)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Liabilities & Equity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {liabilities.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.account_code} - {item.account_name}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(item.current_balance || 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {equity.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.account_code} - {item.account_name}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(item.current_balance || 0)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="font-bold">
                                    <TableCell>Total Liabilities & Equity</TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                        }).format(totalLiabilitiesAndEquity)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

