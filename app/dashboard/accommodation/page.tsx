"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Building2, DoorOpen, CalendarCheck, List, ChevronRight } from "lucide-react"

export default function AccommodationOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        propertiesCount: 0,
        roomsCount: 0,
        bookingsToday: 0,
        waitlistCount: 0,
    })

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        Promise.all([
            supabase.from("accommodations").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("rooms").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase
                .from("accommodation_bookings")
                .select("id", { count: "exact", head: true })
                .lte("check_in_date", today)
                .gte("check_out_date", today)
                .in("status", ["Pending", "Confirmed", "CheckedIn"]),
            supabase.from("booking_waitlist").select("id", { count: "exact", head: true }),
        ]).then(([p, r, b, w]) => {
            setStats({
                propertiesCount: p.count ?? 0,
                roomsCount: r.count ?? 0,
                bookingsToday: b.count ?? 0,
                waitlistCount: w.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Properties",
            value: stats.propertiesCount,
            subtitle: "Active accommodations",
            icon: Building2,
            iconClass: "stat-icon stat-icon-maroon",
        },
        {
            title: "Rooms",
            value: stats.roomsCount,
            subtitle: "Total rooms",
            icon: DoorOpen,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Stays Today",
            value: stats.bookingsToday,
            subtitle: "Active bookings",
            icon: CalendarCheck,
            iconClass: "stat-icon stat-icon-green",
        },
        {
            title: "Waitlist",
            value: stats.waitlistCount,
            subtitle: "Pending requests",
            icon: List,
            iconClass: "stat-icon stat-icon-amber",
        },
    ]

    const links = [
        { title: "Properties", href: "/dashboard/accommodation/properties", description: "Manage guest houses and buildings", icon: Building2, iconClass: "stat-icon-maroon" },
        { title: "Rooms", href: "/dashboard/accommodation/rooms", description: "Room inventory and amenities", icon: DoorOpen, iconClass: "stat-icon-blue" },
        { title: "Bookings", href: "/dashboard/accommodation/bookings", description: "Reservations and check-in/out", icon: CalendarCheck, iconClass: "stat-icon-green" },
        { title: "Waitlist", href: "/dashboard/accommodation/waitlist", description: "Pending accommodation requests", icon: List, iconClass: "stat-icon-amber" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Accommodation</h1>
                <p className="text-sm text-muted-foreground mt-1">Hotel-style management: properties, rooms, and bookings.</p>
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
