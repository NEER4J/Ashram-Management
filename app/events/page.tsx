"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

type PublicEvent = {
    id: string
    name: string
    slug: string
    type: string | null
    start_date: string
    end_date: string
    city: string | null
    state: string | null
    description: string | null
}

export default function EventsListingPage() {
    const [events, setEvents] = useState<PublicEvent[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchEvents()
    }, [])

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from("temple_events")
                .select("id, name, slug, type, start_date, end_date, city, state, description")
                .eq("is_published", true)
                .eq("is_active", true)
                .order("start_date", { ascending: true })

            if (error) throw error
            setEvents((data || []).filter(e => e.slug !== null) as PublicEvent[])
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
                    <p style={{ color: "#3c0212" }}>Loading events...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            {/* Hero Section */}
            <section className="relative py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: "#3c0212" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                <div className="container mx-auto max-w-6xl text-center relative z-10">
                    <div className="opacity-0 animate-fade-in">
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight tracking-tight" style={{ color: "#fef9fb" }}>
                            Upcoming Events
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light" style={{ color: "#fef9fb", opacity: 0.95 }}>
                            Join us for divine spiritual experiences and celebrations
                        </p>
                    </div>
                </div>
            </section>

            {/* Events Listing */}
            <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="container mx-auto max-w-7xl">
                    {events.length === 0 ? (
                        <Card className="p-12 md:p-16 text-center rounded-2xl shadow-lg" style={{ backgroundColor: "#fef9fb" }}>
                            <p className="text-xl md:text-2xl text-gray-600">No upcoming events at this time. Please check back soon!</p>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {events.map((event, index) => (
                                <div
                                    key={event.id}
                                    className="opacity-0 animate-fade-in-delay"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Card 
                                        className="flex flex-col h-full rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:border-[#3c0212]/30 group" 
                                        style={{ 
                                            backgroundColor: "#fef9fb", 
                                            borderColor: "#e5e5e5",
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                        onClick={() => router.push(`/events/${event.slug}`)}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <CardTitle className="font-serif text-xl md:text-2xl font-bold leading-tight flex-1 group-hover:text-[#3c0212]/90 transition-colors" style={{ color: "#3c0212" }}>
                                                    {event.name}
                                                </CardTitle>
                                                {event.type && (
                                                    <Badge
                                                        className="w-fit text-xs font-semibold rounded-full px-3 py-1.5 flex-shrink-0 shadow-sm"
                                                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                                    >
                                                        {event.type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <CardDescription className="flex items-center gap-2 text-sm md:text-base">
                                                    <div className="p-1.5 rounded-lg bg-[#3c0212]/10 group-hover:bg-[#3c0212]/20 transition-colors">
                                                        <Calendar className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#3c0212" }} />
                                                    </div>
                                                    <span className="font-medium text-gray-700">
                                                        {formatDate(event.start_date)}
                                                        {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
                                                    </span>
                                                </CardDescription>
                                                {(event.city || event.state) && (
                                                    <CardDescription className="flex items-center gap-2 text-sm md:text-base">
                                                        <div className="p-1.5 rounded-lg bg-[#3c0212]/10 group-hover:bg-[#3c0212]/20 transition-colors">
                                                            <MapPin className="h-4 w-4 md:h-5 md:w-5" style={{ color: "#3c0212" }} />
                                                        </div>
                                                        <span className="text-gray-700">{[event.city, event.state].filter(Boolean).join(", ")}</span>
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col pt-0">
                                            {event.description && (
                                                <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}
                                            <Button
                                                asChild
                                                className="mt-auto w-full rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Link href={`/events/${event.slug}`}>
                                                    Register Now
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    )
}

