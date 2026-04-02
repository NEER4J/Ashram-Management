"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ShieldAlert, Stethoscope, Activity, Heart, ChevronRight } from "lucide-react"

export default function MedicalOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        emergencyContacts: 0,
        upcomingCamps: 0,
        wellnessThisMonth: 0,
        firstAidThisMonth: 0,
    })

    useEffect(() => {
        const now = new Date()
        const today = now.toISOString().slice(0, 10)
        const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

        Promise.all([
            supabase.from("emergency_contacts").select("id", { count: "exact", head: true }),
            supabase
                .from("medical_camps")
                .select("id", { count: "exact", head: true })
                .gte("camp_date", today)
                .in("status", ["Scheduled", "InProgress"]),
            supabase
                .from("wellness_consultations")
                .select("id", { count: "exact", head: true })
                .gte("consultation_date", monthStart)
                .lte("consultation_date", today),
            supabase
                .from("first_aid_incidents")
                .select("id", { count: "exact", head: true })
                .gte("incident_date", monthStart)
                .lte("incident_date", today),
        ]).then(([ec, mc, wc, fa]) => {
            setStats({
                emergencyContacts: ec.count ?? 0,
                upcomingCamps: mc.count ?? 0,
                wellnessThisMonth: wc.count ?? 0,
                firstAidThisMonth: fa.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Emergency Contacts",
            value: stats.emergencyContacts,
            subtitle: "Total contacts",
            icon: ShieldAlert,
            iconClass: "stat-icon bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
        },
        {
            title: "Upcoming Camps",
            value: stats.upcomingCamps,
            subtitle: "Scheduled or in-progress",
            icon: Stethoscope,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Wellness This Month",
            value: stats.wellnessThisMonth,
            subtitle: "Consultations this month",
            icon: Activity,
            iconClass: "stat-icon stat-icon-green",
        },
        {
            title: "First Aid This Month",
            value: stats.firstAidThisMonth,
            subtitle: "Incidents this month",
            icon: Heart,
            iconClass: "stat-icon stat-icon-amber",
        },
    ]

    const links = [
        { title: "Emergency Contacts", href: "/dashboard/medical/emergency", description: "Ambulance, hospital, and doctor contacts", icon: ShieldAlert, iconClass: "stat-icon-maroon" },
        { title: "Medical Camps", href: "/dashboard/medical/camps", description: "Organise and track medical camps", icon: Stethoscope, iconClass: "stat-icon-blue" },
        { title: "Wellness Consultations", href: "/dashboard/medical/wellness", description: "Ayurveda, yoga, and wellness sessions", icon: Activity, iconClass: "stat-icon-green" },
        { title: "First Aid Log", href: "/dashboard/medical/first-aid", description: "Incident reports and first aid records", icon: Heart, iconClass: "stat-icon-amber" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Medical & Healthcare</h1>
                <p className="text-sm text-muted-foreground mt-1">Emergency contacts, medical camps, wellness, and first aid management.</p>
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
