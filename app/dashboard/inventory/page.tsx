"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Package, MapPin, ScrollText, Truck, ArrowRightLeft, Gem, HardHat, ChevronRight, AlertTriangle } from "lucide-react"

export default function InventoryOverviewPage() {
    const supabase = createClient()
    const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, locations: 0, pendingPOs: 0 })

    useEffect(() => {
        Promise.all([
            supabase.from("inventory_items").select("id, current_stock, min_stock_level"),
            supabase.from("inventory_locations").select("id", { count: "exact", head: true }),
            supabase.from("purchase_orders").select("id", { count: "exact", head: true }).in("status", ["Draft", "Submitted", "Approved"]),
            supabase.from("fixed_assets").select("id", { count: "exact", head: true }),
        ]).then(([items, locs, pos, assets]) => {
            const allItems = items.data || []
            setStats({
                totalItems: allItems.length,
                lowStock: allItems.filter((i: any) => i.current_stock <= i.min_stock_level).length,
                locations: locs.count ?? 0,
                pendingPOs: pos.count ?? 0,
            })
        })
    }, [])

    const statCards = [
        {
            title: "Total Items",
            value: stats.totalItems,
            subtitle: "Inventory items",
            icon: Package,
            iconClass: "stat-icon stat-icon-blue",
        },
        {
            title: "Low Stock",
            value: stats.lowStock,
            subtitle: "Below minimum",
            icon: AlertTriangle,
            iconClass: "stat-icon bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
            valueClass: stats.lowStock > 0 ? "text-red-600" : "",
        },
        {
            title: "Locations",
            value: stats.locations,
            subtitle: "Storage areas",
            icon: MapPin,
            iconClass: "stat-icon stat-icon-cyan",
        },
        {
            title: "Pending POs",
            value: stats.pendingPOs,
            subtitle: "Active orders",
            icon: Truck,
            iconClass: "stat-icon stat-icon-amber",
        },
    ]

    const links = [
        { title: "Items", href: "/dashboard/inventory/items", description: "Manage inventory items and stock levels", icon: Package, iconClass: "stat-icon-blue" },
        { title: "Locations", href: "/dashboard/inventory/locations", description: "Warehouses, storerooms, and storage areas", icon: MapPin, iconClass: "stat-icon-cyan" },
        { title: "Transactions", href: "/dashboard/inventory/transactions", description: "Stock IN/OUT audit trail", icon: ScrollText, iconClass: "stat-icon-green" },
        { title: "Purchase Orders", href: "/dashboard/inventory/purchase-orders", description: "Create and track purchase orders", icon: Truck, iconClass: "stat-icon-amber" },
        { title: "Transfers", href: "/dashboard/inventory/transfers", description: "Move items between locations", icon: ArrowRightLeft, iconClass: "stat-icon-violet" },
        { title: "Religious Items", href: "/dashboard/inventory/religious", description: "Puja samagri, idols, books", icon: Gem, iconClass: "stat-icon-maroon" },
        { title: "Fixed Assets", href: "/dashboard/inventory/assets", description: "Land, buildings, vehicles, equipment", icon: HardHat, iconClass: "stat-icon-green" },
    ]

    return (
        <div className="space-y-8 p-6 md:p-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
                <p className="text-sm text-muted-foreground mt-1">Track items, locations, orders, transfers, and assets.</p>
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
