"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, ClipboardList, Clock, BadgeCheck, Award, ChevronRight } from "lucide-react"

export default function SevaOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        volunteersCount: 0,
        opportunitiesCount: 0,
        upcomingShifts: 0,
        assignmentsMonth: 0,
        totalHoursMonth: 0,
        badgesCount: 0,
    })

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        const monthStart = today.slice(0, 7) + "-01"
        Promise.all([
            supabase.from("volunteers").select("id", { count: "exact", head: true }),
            supabase.from("seva_opportunities").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("seva_shifts").select("id", { count: "exact", head: true }).gte("shift_date", today),
            supabase.from("seva_assignments").select("id, hours_actual").gte("created_at", monthStart),
            supabase.from("volunteer_badges").select("id", { count: "exact", head: true }),
        ]).then(([vol, opp, shifts, assign, badges]) => {
            const assignments = assign.data || []
            setStats({
                volunteersCount: vol.count ?? 0,
                opportunitiesCount: opp.count ?? 0,
                upcomingShifts: shifts.count ?? 0,
                assignmentsMonth: assignments.length,
                totalHoursMonth: assignments.reduce((sum: number, a: any) => sum + (a.hours_actual || 0), 0),
                badgesCount: badges.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Volunteers",
            value: stats.volunteersCount,
            subtitle: "Registered volunteers",
            icon: Users,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Upcoming Shifts",
            value: stats.upcomingShifts,
            subtitle: "Shifts scheduled",
            icon: Clock,
            iconClass: "stat-icon stat-icon-amber",
        },
        {
            title: "Hours This Month",
            value: stats.totalHoursMonth,
            subtitle: "Volunteer hours logged",
            icon: BadgeCheck,
            iconClass: "stat-icon stat-icon-green",
        },
        {
            title: "Badges",
            value: stats.badgesCount,
            subtitle: "Total awarded",
            icon: Award,
            iconClass: "stat-icon stat-icon-violet",
        },
    ]

    const links = [
        { title: "Volunteers", href: "/dashboard/seva/volunteers", description: "Manage volunteer roster and skills", icon: Users, iconClass: "stat-icon-blue" },
        { title: "Opportunities", href: "/dashboard/seva/opportunities", description: "Seva opportunities and categories", icon: ClipboardList, iconClass: "stat-icon-maroon" },
        { title: "Shifts", href: "/dashboard/seva/shifts", description: "Schedule and manage shifts", icon: Clock, iconClass: "stat-icon-amber" },
        { title: "Assignments", href: "/dashboard/seva/assignments", description: "Assign volunteers and track hours", icon: BadgeCheck, iconClass: "stat-icon-green" },
        { title: "Badges", href: "/dashboard/seva/badges", description: "Award volunteer achievements", icon: Award, iconClass: "stat-icon-violet" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Seva & Volunteers</h1>
                <p className="text-sm text-muted-foreground mt-1">Coordinate volunteer service, shifts, and recognition.</p>
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
