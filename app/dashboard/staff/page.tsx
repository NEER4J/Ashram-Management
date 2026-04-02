"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, UserCheck, Building2, CalendarCheck, ChevronRight, BookOpen } from "lucide-react"

export default function StaffOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        totalActive: 0,
        priestCount: 0,
        presentToday: 0,
        departmentsCount: 0,
    })

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        Promise.all([
            supabase.from("staff").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("staff").select("id", { count: "exact", head: true }).eq("role", "Priest").eq("is_active", true),
            supabase.from("staff_attendance").select("id", { count: "exact", head: true }).eq("attendance_date", today).eq("status", "Present"),
            supabase.from("staff_departments").select("id", { count: "exact", head: true }),
        ]).then(([active, priests, attendance, departments]) => {
            setStats({
                totalActive: active.count ?? 0,
                priestCount: priests.count ?? 0,
                presentToday: attendance.count ?? 0,
                departmentsCount: departments.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Active Staff",
            value: stats.totalActive,
            subtitle: "Total active members",
            icon: Users,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Priests",
            value: stats.priestCount,
            subtitle: "Active priests",
            icon: BookOpen,
            iconClass: "stat-icon stat-icon-maroon",
        },
        {
            title: "Present Today",
            value: stats.presentToday,
            subtitle: "Checked in today",
            icon: UserCheck,
            iconClass: "stat-icon stat-icon-green",
        },
        {
            title: "Departments",
            value: stats.departmentsCount,
            subtitle: "Total departments",
            icon: Building2,
            iconClass: "stat-icon stat-icon-violet",
        },
    ]

    const links = [
        { title: "Staff Directory", href: "/dashboard/staff/directory", description: "View and manage all staff members", icon: Users, iconClass: "stat-icon-blue" },
        { title: "Priests", href: "/dashboard/staff/priests", description: "Manage priests, skills, and languages", icon: BookOpen, iconClass: "stat-icon-maroon" },
        { title: "Departments", href: "/dashboard/staff/departments", description: "Manage departments and team leads", icon: Building2, iconClass: "stat-icon-violet" },
        { title: "Attendance", href: "/dashboard/staff/attendance", description: "Daily attendance tracking and records", icon: CalendarCheck, iconClass: "stat-icon-green" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Staff & Priests</h1>
                <p className="text-sm text-muted-foreground mt-1">Directory, departments, attendance, and priest management.</p>
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
