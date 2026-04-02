"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ClipboardList, History, BarChart3, ChevronRight, Users, Star, LogIn } from "lucide-react"

export default function VisitorsOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        todayTotal: 0,
        checkedIn: 0,
        checkedOut: 0,
        vipToday: 0,
    })

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        supabase.from("visitor_registrations").select("id, check_in_at, check_out_at, is_vip").eq("visit_date", today).then(({ data }) => {
            const visitors = data || []
            setStats({
                todayTotal: visitors.length,
                checkedIn: visitors.filter((v: any) => v.check_in_at && !v.check_out_at).length,
                checkedOut: visitors.filter((v: any) => v.check_out_at).length,
                vipToday: visitors.filter((v: any) => v.is_vip).length,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Today's Visitors",
            value: stats.todayTotal,
            subtitle: "Total registered today",
            icon: Users,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Currently In",
            value: stats.checkedIn,
            subtitle: "Checked in, not out",
            icon: LogIn,
            iconClass: "stat-icon stat-icon-green",
        },
        {
            title: "Checked Out",
            value: stats.checkedOut,
            subtitle: "Completed visits",
            icon: Users,
            iconClass: "stat-icon stat-icon-cyan",
        },
        {
            title: "VIP",
            value: stats.vipToday,
            subtitle: "VIP visitors today",
            icon: Star,
            iconClass: "stat-icon stat-icon-amber",
        },
    ]

    const links = [
        { title: "Today's Visitors", href: "/dashboard/visitors/today", description: "Register, check-in/out, and manage today's visitors", icon: ClipboardList, iconClass: "stat-icon-maroon" },
        { title: "History", href: "/dashboard/visitors/history", description: "Search and browse all past visits", icon: History, iconClass: "stat-icon-blue" },
        { title: "Analytics", href: "/dashboard/visitors/analytics", description: "Visitor trends, peak hours, and insights", icon: BarChart3, iconClass: "stat-icon-violet" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Visitors</h1>
                <p className="text-sm text-muted-foreground mt-1">Registration, check-in/out, passes, and analytics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="group hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                                </div>
                                <div className={stat.iconClass}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Navigation */}
            <div>
                <h2 className="text-lg font-semibold tracking-tight mb-4">Modules</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                    {links.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Card className="group hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className={`stat-icon ${item.iconClass} transition-transform duration-200 group-hover:scale-110`}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
