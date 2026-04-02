"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package, UtensilsCrossed, Ticket, HandPlatter, HandHeart, ChevronRight, AlertTriangle, TrendingUp } from "lucide-react"

export default function KitchenOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({
        inventoryCount: 0,
        lowStockCount: 0,
        mealsToday: 0,
        tokensToday: 0,
        prasadPending: 0,
        annadaanMonth: 0,
    })

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10)
        const monthStart = today.slice(0, 7) + "-01"
        Promise.all([
            supabase.from("kitchen_inventory").select("id, quantity, min_level"),
            supabase.from("meal_menus").select("id", { count: "exact", head: true }).eq("menu_date", today),
            supabase.from("meal_tokens").select("id", { count: "exact", head: true }).eq("meal_date", today),
            supabase.from("prasad_bookings").select("id", { count: "exact", head: true }).eq("status", "Pending"),
            supabase.from("annadaan_donations").select("id", { count: "exact", head: true }).gte("donation_date", monthStart),
        ]).then(([inv, meals, tokens, prasad, anna]) => {
            const items = inv.data || []
            setStats({
                inventoryCount: items.length,
                lowStockCount: items.filter((i: any) => i.quantity <= i.min_level).length,
                mealsToday: meals.count ?? 0,
                tokensToday: tokens.count ?? 0,
                prasadPending: prasad.count ?? 0,
                annadaanMonth: anna.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Inventory Items",
            value: stats.inventoryCount,
            subtitle: "Total items tracked",
            icon: Package,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Low Stock",
            value: stats.lowStockCount,
            subtitle: "Below minimum level",
            icon: AlertTriangle,
            iconClass: "stat-icon bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
            valueClass: stats.lowStockCount > 0 ? "text-red-600" : "",
        },
        {
            title: "Tokens Today",
            value: stats.tokensToday,
            subtitle: "Meal tokens issued",
            icon: Ticket,
            iconClass: "stat-icon stat-icon-violet",
        },
        {
            title: "Prasad Pending",
            value: stats.prasadPending,
            subtitle: "Awaiting preparation",
            icon: HandPlatter,
            iconClass: "stat-icon stat-icon-amber",
        },
    ]

    const links = [
        { title: "Inventory", href: "/dashboard/kitchen/inventory", description: "Manage kitchen stock and supplies", icon: Package, iconClass: "stat-icon-blue" },
        { title: "Meal Planning", href: "/dashboard/kitchen/meals", description: "Plan daily menus for all meals", icon: UtensilsCrossed, iconClass: "stat-icon-maroon" },
        { title: "Meal Tokens", href: "/dashboard/kitchen/tokens", description: "Issue and track meal tokens", icon: Ticket, iconClass: "stat-icon-violet" },
        { title: "Prasad Bookings", href: "/dashboard/kitchen/prasad", description: "Manage prasad reservations", icon: HandPlatter, iconClass: "stat-icon-amber" },
        { title: "Annadaan", href: "/dashboard/kitchen/annadaan", description: "Track langar and food donations", icon: HandHeart, iconClass: "stat-icon-green" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Kitchen & Prasad</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage meals, inventory, tokens, prasad, and annadaan donations.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
                {statCards.map((stat) => (
                    <Card key={stat.title} className="group hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                                    <p className={`text-3xl font-bold tracking-tight ${stat.valueClass || ""}`}>{stat.value}</p>
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
