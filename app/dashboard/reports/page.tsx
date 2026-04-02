"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Banknote, CalendarDays, Building2, Heart } from "lucide-react"

const reportLinks = [
    { title: "Devotees", description: "Growth, membership, tags", href: "/dashboard/devotees", icon: Users },
    { title: "Donations", description: "By category, trend", href: "/dashboard/donations", icon: Banknote },
    { title: "Events", description: "Attendance, registrations", href: "/dashboard/events", icon: CalendarDays },
    { title: "Accommodation", description: "Occupancy, bookings", href: "/dashboard/accommodation", icon: Building2 },
    { title: "Seva", description: "Hours by volunteer", href: "/dashboard/seva", icon: Heart },
    { title: "Financial reports", description: "P&L, Balance sheet, Cash flow", href: "/dashboard/accounting/reports", icon: FileText },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6 p-8">
            <h2 className="text-2xl font-semibold">Reports</h2>
            <p className="text-muted-foreground">Access data and reports by module.</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportLinks.map((r) => (
                    <Link key={r.href} href={r.href}>
                        <Card className="hover:border-primary transition-colors">
                            <CardHeader className="flex flex-row items-center gap-2">
                                <r.icon className="h-5 w-5" />
                                <CardTitle className="text-base">{r.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{r.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
