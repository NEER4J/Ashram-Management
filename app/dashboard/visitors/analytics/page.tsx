"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["#b82256", "#0891b2", "#8b5cf6", "#f59e0b", "#10b981", "#e11d48", "#0284c7", "#7c3aed"]

export default function VisitorAnalyticsPage() {
    const supabase = createClient()
    const [dailyData, setDailyData] = useState<{ date: string; count: number }[]>([])
    const [purposeData, setPurposeData] = useState<{ name: string; value: number }[]>([])
    const [dateFrom, setDateFrom] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        return d.toISOString().slice(0, 10)
    })
    const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

    useEffect(() => {
        const fetchAnalytics = async () => {
            const { data: visitors } = await supabase
                .from("visitor_registrations")
                .select("visit_date, visit_purpose")
                .gte("visit_date", dateFrom)
                .lte("visit_date", dateTo)

            if (!visitors) return

            // Daily counts
            const dateMap: Record<string, number> = {}
            const purposeMap: Record<string, number> = {}

            visitors.forEach((v: any) => {
                dateMap[v.visit_date] = (dateMap[v.visit_date] || 0) + 1
                const purpose = v.visit_purpose || "Not specified"
                purposeMap[purpose] = (purposeMap[purpose] || 0) + 1
            })

            setDailyData(
                Object.entries(dateMap)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([date, count]) => ({ date, count }))
            )

            setPurposeData(
                Object.entries(purposeMap)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 8)
                    .map(([name, value]) => ({ name, value }))
            )
        }

        fetchAnalytics()
    }, [dateFrom, dateTo])

    const totalVisitors = dailyData.reduce((sum, d) => sum + d.count, 0)
    const avgPerDay = dailyData.length > 0 ? Math.round(totalVisitors / dailyData.length) : 0

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Visitor Analytics</h2>
                <p className="text-sm text-muted-foreground mt-1">Trends, purpose breakdown, and visit insights.</p>
            </div>

            <div className="flex gap-4 items-center">
                <div><Label>From</Label><Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
                <div><Label>To</Label><Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalVisitors}</div>
                        <p className="text-xs text-muted-foreground">in selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Per Day</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{avgPerDay}</div>
                        <p className="text-xs text-muted-foreground">visitors/day</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Visitor Count</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyData}>
                                <XAxis dataKey="date" fontSize={12} tickFormatter={(d) => d.slice(5)} />
                                <YAxis fontSize={12} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#b82256" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visit Purpose Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        {purposeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={purposeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                        {purposeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted-foreground">No data for selected period</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
