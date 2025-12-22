"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Users,
    Banknote,
    CalendarCheck,
    CalendarDays,
    UserCog,
    Package,
    ArrowRight,
    Loader2,
} from "lucide-react";

interface DashboardStats {
    totalDevotees: number;
    totalDonations: number;
    totalDonationAmount: number;
    totalPujaBookings: number;
    upcomingPujas: number;
    totalEvents: number;
    totalStaff: number;
    totalInventory: number;
    lowStockItems: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalDevotees: 0,
        totalDonations: 0,
        totalDonationAmount: 0,
        totalPujaBookings: 0,
        upcomingPujas: 0,
        totalEvents: 0,
        totalStaff: 0,
        totalInventory: 0,
        lowStockItems: 0,
    });
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all statistics in parallel
                const [
                    devoteesResult,
                    donationsResult,
                    pujaBookingsResult,
                    eventsResult,
                    staffResult,
                    inventoryResult,
                ] = await Promise.all([
                    supabase.from("devotees").select("id", { count: "exact", head: true }),
                    supabase.from("donations").select("id, amount", { count: "exact" }),
                    supabase
                        .from("puja_bookings")
                        .select("id, puja_date", { count: "exact" }),
                    supabase.from("events").select("id", { count: "exact", head: true }),
                    supabase.from("staff").select("id", { count: "exact", head: true }),
                    supabase.from("inventory_items").select("id, stock_quantity, min_stock_level", { count: "exact" }),
                ]);

                const totalDonationAmount =
                    donationsResult.data?.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) || 0;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const upcomingPujas =
                    pujaBookingsResult.data?.filter(
                        (p) => new Date(p.puja_date) >= today
                    ).length || 0;

                const lowStockItems =
                    inventoryResult.data?.filter(
                        (item) => item.stock_quantity <= item.min_stock_level
                    ).length || 0;

                setStats({
                    totalDevotees: devoteesResult.count || 0,
                    totalDonations: donationsResult.count || 0,
                    totalDonationAmount,
                    totalPujaBookings: pujaBookingsResult.count || 0,
                    upcomingPujas,
                    totalEvents: eventsResult.count || 0,
                    totalStaff: staffResult.count || 0,
                    totalInventory: inventoryResult.count || 0,
                    lowStockItems,
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [supabase]);

    const statCards = [
        {
            title: "Total Devotees",
            value: stats.totalDevotees,
            icon: Users,
            link: "/dashboard/devotees",
        },
        {
            title: "Total Donations",
            value: stats.totalDonations,
            subtitle: new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(stats.totalDonationAmount),
            icon: Banknote,
            link: "/dashboard/donations",
        },
        {
            title: "Puja Bookings",
            value: stats.totalPujaBookings,
            subtitle: `${stats.upcomingPujas} upcoming`,
            icon: CalendarCheck,
            link: "/dashboard/pujas",
        },
        {
            title: "Events",
            value: stats.totalEvents,
            icon: CalendarDays,
            link: "/dashboard/events",
        },
        {
            title: "Staff & Priests",
            value: stats.totalStaff,
            icon: UserCog,
            link: "/dashboard/staff",
        },
        {
            title: "Inventory Items",
            value: stats.totalInventory,
            subtitle: stats.lowStockItems > 0 ? `${stats.lowStockItems} low stock` : "All stocked",
            icon: Package,
            link: "/dashboard/inventory",
        },
    ];

    const quickActions = [
        { title: "Add Devotee", link: "/dashboard/devotees", icon: Users },
        { title: "Record Donation", link: "/dashboard/donations", icon: Banknote },
        { title: "Book Puja", link: "/dashboard/pujas", icon: CalendarCheck },
        { title: "Create Event", link: "/dashboard/events", icon: CalendarDays },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-8">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Dashboard
                </h1>
                <p className="text-slate-600 mt-1">
                    Overview of your Ashram operations and key metrics
                </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={card.title}
                            className="hover:shadow-md transition-shadow cursor-pointer border-slate-200"
                            onClick={() => (window.location.href = card.link)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">
                                    {card.title}
                                </CardTitle>
                                <div className="p-2 rounded-lg" style={{ backgroundColor: "#fef9fb" }}>
                                    <Icon className="h-5 w-5" style={{ color: "#3c0212" }} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">
                                    {card.value.toLocaleString()}
                                </div>
                                {card.subtitle && (
                                    <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-slate-900">Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks and frequently used features
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link key={action.title} href={action.link}>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start h-auto py-3 px-4 hover:bg-slate-50 border-slate-200"
                                    >
                                        <Icon className="mr-2 h-4 w-4" style={{ color: "#3c0212" }} />
                                        <span className="text-sm text-slate-900">{action.title}</span>
                                        <ArrowRight className="ml-auto h-4 w-4 opacity-50 text-slate-600" />
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
