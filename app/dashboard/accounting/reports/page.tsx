"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp, Scale, DollarSign, Receipt } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
    const reports = [
        {
            title: "Profit & Loss Statement",
            description: "View income and expenses for a period",
            icon: TrendingUp,
            href: "/dashboard/accounting/reports/profit-loss",
        },
        {
            title: "Balance Sheet",
            description: "View assets, liabilities, and equity",
            icon: Scale,
            href: "/dashboard/accounting/reports/balance-sheet",
        },
        {
            title: "Trial Balance",
            description: "View all account balances",
            icon: FileText,
            href: "/dashboard/accounting/reports/trial-balance",
        },
        {
            title: "Cash Flow Statement",
            description: "View cash inflows and outflows",
            icon: DollarSign,
            href: "/dashboard/accounting/reports/cash-flow",
        },
        {
            title: "GST Reports",
            description: "View GST returns and reports",
            icon: Receipt,
            href: "/dashboard/accounting/reports/gst-reports",
        },
    ]

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Financial Reports</h2>
                <p className="text-muted-foreground">
                    Generate and view financial reports and statements.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <Card key={report.href}>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <report.icon className="h-8 w-8" style={{ color: "#3c0212" }} />
                                <div>
                                    <CardTitle>{report.title}</CardTitle>
                                    <CardDescription>{report.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button asChild style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                                <Link href={report.href}>View Report</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

