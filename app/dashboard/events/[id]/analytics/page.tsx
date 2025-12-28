"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, QrCode } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
// @ts-ignore - qrcode.react types may not be available
import { QRCodeSVG } from "qrcode.react"

type AnalyticsData = {
    total_scans: number
    total_submissions: number
    conversion_rate: number
}

type RecentRegistration = {
    id: string
    first_name: string
    last_name: string | null
    mobile_number: string
    email: string | null
    occupation: string | null
    created_at: string
}

type EventDetails = {
    id: string
    name: string
    slug: string | null
}

export default function EventAnalyticsPage() {
    const params = useParams()
    const eventId = params?.id as string
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        total_scans: 0,
        total_submissions: 0,
        conversion_rate: 0,
    })
    const [event, setEvent] = useState<EventDetails | null>(null)
    const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([])
    const [loading, setLoading] = useState(true)
    const qrCodeRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const formUrl = event?.slug
        ? typeof window !== "undefined"
            ? `${window.location.origin}/events/${event.slug}`
            : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/events/${event.slug}`
        : ""

    useEffect(() => {
        if (eventId) {
            fetchEvent()
            fetchAnalytics()
            fetchRecentRegistrations()
        }
    }, [eventId])

    const fetchEvent = async () => {
        try {
            const { data, error } = await supabase
                .from("temple_events")
                .select("id, name, slug")
                .eq("id", eventId)
                .single()

            if (error) throw error
            setEvent(data)
        } catch (error) {
            console.error("Error fetching event:", error)
            toast.error("Failed to fetch event details")
        }
    }

    const fetchAnalytics = async () => {
        try {
            // Get total QR scans
            const { count: scanCount, error: scanError } = await supabase
                .from("event_registration_analytics")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)

            if (scanError) throw scanError

            // Get total form submissions
            const { count: submitCount, error: submitError } = await supabase
                .from("event_registration_analytics")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)
                .not("form_submitted_at", "is", null)

            if (submitError) throw submitError

            const totalScans = scanCount || 0
            const totalSubmissions = submitCount || 0
            const conversionRate = totalScans > 0 ? ((totalSubmissions / totalScans) * 100).toFixed(2) : 0

            setAnalytics({
                total_scans: totalScans,
                total_submissions: totalSubmissions,
                conversion_rate: parseFloat(conversionRate),
            })
        } catch (error) {
            console.error("Error fetching analytics:", error)
            toast.error("Failed to fetch analytics")
        } finally {
            setLoading(false)
        }
    }

    const fetchRecentRegistrations = async () => {
        try {
            const { data, error } = await supabase
                .from("devotees")
                .select("id, first_name, last_name, mobile_number, email, occupation, created_at")
                .eq("event_source", event?.slug || "")
                .order("created_at", { ascending: false })
                .limit(50)

            if (error) throw error
            setRecentRegistrations(data || [])
        } catch (error) {
            console.error("Error fetching recent registrations:", error)
            toast.error("Failed to fetch recent registrations")
        }
    }

    useEffect(() => {
        if (event?.slug) {
            fetchRecentRegistrations()
        }
    }, [event?.slug])

    const downloadQRCode = () => {
        if (!qrCodeRef.current || !formUrl) return

        const svg = qrCodeRef.current.querySelector("svg")
        if (!svg) return

        // Download as SVG (simpler and reliable)
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(svgBlob)
        const downloadLink = document.createElement("a")
        downloadLink.download = `${event?.slug || 'event'}-qr-code.svg`
        downloadLink.href = url
        downloadLink.click()
        URL.revokeObjectURL(url)
    }

    const columns: ColumnDef<RecentRegistration>[] = [
        {
            accessorKey: "first_name",
            header: "Name",
            cell: ({ row }) => {
                const firstName = row.getValue("first_name") as string
                const lastName = row.original.last_name
                return `${firstName} ${lastName || ""}`.trim()
            },
        },
        {
            accessorKey: "mobile_number",
            header: "Phone",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || "-",
        },
        {
            accessorKey: "occupation",
            header: "Occupation",
            cell: ({ row }) => row.original.occupation || "-",
        },
        {
            accessorKey: "created_at",
            header: "Registered At",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"))
                return date.toLocaleString()
            },
        },
    ]

    if (loading) {
        return (
            <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
                    <p>Loading analytics...</p>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="text-center py-12">
                    <p className="text-xl text-red-600">Event not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-medium tracking-tight">{event.name} - Analytics</h2>
                    <p className="text-muted-foreground">
                        Track QR code scans and form submissions for this event.
                    </p>
                </div>
            </div>

            {/* QR Code Section */}
            {event.slug && formUrl && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>QR Code for Event Registration</CardTitle>
                                <CardDescription>
                                    Share this QR code on posters and promotional materials
                                </CardDescription>
                            </div>
                            <Button onClick={downloadQRCode} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Download QR Code
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center p-6 bg-white rounded-lg" ref={qrCodeRef}>
                            <QRCodeSVG
                                value={formUrl}
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Registration URL: <a href={formUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{formUrl}</a>
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.total_scans}</div>
                        <p className="text-xs text-muted-foreground">
                            Unique QR code scans
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Form Submissions</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.total_submissions}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed registrations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.conversion_rate.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground">
                            Scans to submissions ratio
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Registrations */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Registrations</CardTitle>
                    <CardDescription>
                        Latest devotee registrations for this event
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={recentRegistrations}
                        columns={columns}
                        searchKey="first_name"
                        searchPlaceholder="Search by name..."
                    />
                </CardContent>
            </Card>
        </div>
    )
}

