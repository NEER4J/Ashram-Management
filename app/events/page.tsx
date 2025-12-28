"use client"

import { useEffect, useState } from "react"
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
        <div className="min-h-screen" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#3c0212" }}>
                <div className="container mx-auto max-w-6xl text-center">
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: "#fef9fb" }}>
                        Upcoming Events
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto" style={{ color: "#fef9fb", opacity: 0.9 }}>
                        Join us for divine spiritual experiences and celebrations
                    </p>
                </div>
            </section>

            {/* Events Listing */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    {events.length === 0 ? (
                        <Card className="p-12 text-center" style={{ backgroundColor: "#fef9fb" }}>
                            <p className="text-xl text-gray-600">No upcoming events at this time. Please check back soon!</p>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <Card key={event.id} className="flex flex-col" style={{ backgroundColor: "#fef9fb" }}>
                                    <CardHeader>
                                        <CardTitle className="font-serif text-2xl font-bold mb-2" style={{ color: "#3c0212" }}>
                                            {event.name}
                                        </CardTitle>
                                        {event.type && (
                                            <Badge 
                                                variant="secondary" 
                                                className="w-fit mb-2 text-xs font-medium"
                                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                            >
                                                {event.type}
                                            </Badge>
                                        )}
                                        <CardDescription className="flex items-center gap-2 mt-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(event.start_date)}</span>
                                            {event.start_date !== event.end_date && (
                                                <>
                                                    <span>to</span>
                                                    <span>{formatDate(event.end_date)}</span>
                                                </>
                                            )}
                                        </CardDescription>
                                        {(event.city || event.state) && (
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{[event.city, event.state].filter(Boolean).join(", ")}</span>
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        {event.description && (
                                            <p className="text-gray-600 mb-4 line-clamp-3">
                                                {event.description}
                                            </p>
                                        )}
                                        <Button
                                            asChild
                                            className="mt-auto w-full"
                                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                        >
                                            <Link href={`/events/${event.slug}`}>
                                                Register Now
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    )
}

