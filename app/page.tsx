"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FeatureSection } from "@/components/feature-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialCard } from "@/components/gurukul/material-card"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export default function Home() {
    const [events, setEvents] = useState<PublicEvent[]>([])
    const [featuredMaterials, setFeaturedMaterials] = useState<any[]>([])
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // Fetch published events
            const { data: eventsData } = await supabase
                .from("temple_events")
                .select("id, name, slug, type, start_date, end_date, city, state, description")
                .eq("is_published", true)
                .order("start_date", { ascending: true })
                .limit(6)

            if (eventsData) {
                setEvents((eventsData || []).filter(e => e.slug !== null) as PublicEvent[])
            }

            // Fetch featured materials (excluding courses)
            const { data: materialsData } = await supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("is_published", true)
                .neq("type", "Course")
                .order("created_at", { ascending: false })
                .limit(6)

            if (materialsData) {
                setFeaturedMaterials(materialsData)
            }

            // Fetch featured courses
            const { data: coursesData } = await supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("is_published", true)
                .eq("type", "Course")
                .order("created_at", { ascending: false })
                .limit(6)

            if (coursesData) {
                setFeaturedCourses(coursesData)
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    }

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />

            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#3c0212" }}>
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="font-serif text-5xl md:text-6xl font-medium mb-6" style={{ color: "#fef9fb" }}>
                        Welcome to Our Ashram
                    </h1>
                    <p className="text-xl md:text-2xl mb-8" style={{ color: "#fef9fb", opacity: 0.95 }}>
                        Experience divine spirituality, wisdom, and community. Join us for events, courses, and spiritual growth.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {events.length > 0 && (
                            <Button
                                asChild
                                size="lg"
                                className="font-bold text-lg px-8 py-6"
                                style={{
                                    backgroundColor: "#fef9fb",
                                    color: "#3c0212",
                                }}
                            >
                                <Link href="/events">View Events</Link>
                            </Button>
                        )}
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="font-bold text-lg px-8 py-6"
                            style={{
                                backgroundColor: "transparent",
                                borderColor: "#fef9fb",
                                color: "#fef9fb",
                            }}
                        >
                            <Link href="/gurukul">Explore Store & Courses</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            {events.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-semibold" style={{ color: "#3c0212" }}>Upcoming Events</h2>
                            <Link href="/events">
                                <Button variant="outline" style={{ borderColor: "#3c0212", color: "#3c0212" }}>
                                    View All Events
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event) => (
                                <Link key={event.id} href={`/events/${event.slug}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" style={{ backgroundColor: "#fef9fb" }}>
                                        <CardHeader>
                                            <CardTitle className="text-xl font-serif mb-2" style={{ color: "#3c0212" }}>
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
                                            <CardDescription className="text-sm line-clamp-2">
                                                {event.description || "Join us for a divine spiritual experience"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {formatDate(event.start_date)}
                                                        {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
                                                    </span>
                                                </div>
                                                {(event.city || event.state) && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{[event.city, event.state].filter(Boolean).join(", ")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Store Items Section (Courses + Materials) */}
            {(featuredCourses.length > 0 || featuredMaterials.length > 0) && (
                <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fef9fb" }}>
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-semibold" style={{ color: "#3c0212" }}>Store & Courses</h2>
                            <div className="flex gap-2">
                                <Link href="/gurukul/materials">
                                    <Button variant="outline" style={{ borderColor: "#3c0212", color: "#3c0212" }}>
                                        View All
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...featuredCourses, ...featuredMaterials].slice(0, 9).map((item) => (
                                <MaterialCard
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    description={item.description}
                                    type={item.type}
                                    price={item.price}
                                    is_free={item.is_free}
                                    cover_image_url={item.cover_image_url}
                                    author={item.author}
                                    category={item.master_material_categories?.name}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <FeatureSection />

            <Footer />
        </main>
    )
}
