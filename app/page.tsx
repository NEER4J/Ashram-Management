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
            <section className="relative flex-1 flex items-center justify-center py-24 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: "#3c0212" }}>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #fef9fb 1px, transparent 0)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <div className="opacity-0 animate-fade-in">
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 md:mb-8 leading-tight tracking-tight" style={{ color: "#fef9fb" }}>
                            Welcome to Our Ashram
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light" style={{ color: "#fef9fb", opacity: 0.95 }}>
                            Experience divine spirituality, wisdom, and community. Join us for events, courses, and spiritual growth.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center">
                            {events.length > 0 && (
                                <Button
                                    asChild
                                    size="lg"
                                    className="font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                                    style={{
                                        backgroundColor: "#fef9fb",
                                        color: "#3c0212",
                                    }}
                                >
                                    <Link href="/events" className="flex items-center gap-2">
                                        View Events
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>
                            )}
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="font-semibold text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:shadow-xl backdrop-blur-sm"
                                style={{
                                    backgroundColor: "transparent",
                                    borderColor: "#fef9fb",
                                    color: "#fef9fb",
                                }}
                            >
                                <Link href="/gurukul" className="flex items-center gap-2">
                                    Explore Store & Courses
                                    <BookOpen className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            {events.length > 0 && (
                <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 lg:mb-16 gap-4 opacity-0 animate-fade-in">
                            <div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 md:mb-3 tracking-tight" style={{ color: "#3c0212" }}>
                                    Upcoming Events
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 font-light">Join us for divine spiritual experiences</p>
                            </div>
                            <Link href="/events">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg px-6 py-6 group"
                                    style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                >
                                    View All Events
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {events.map((event, index) => (
                                <Link 
                                    key={event.id} 
                                    href={`/events/${event.slug}`}
                                    className="opacity-0 animate-fade-in-delay"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <Card 
                                        className="h-full rounded-2xl border transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:-translate-y-2 hover:border-[#3c0212]/30" 
                                        style={{ 
                                            backgroundColor: "#fef9fb", 
                                            borderColor: "#e5e5e5",
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <CardTitle className="text-xl md:text-2xl font-serif font-bold leading-tight flex-1 group-hover:text-[#3c0212]/90 transition-colors" style={{ color: "#3c0212" }}>
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
                                            <CardDescription className="text-sm md:text-base text-gray-600 line-clamp-2 leading-relaxed">
                                                {event.description || "Join us for a divine spiritual experience"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                                                    <div className="p-1.5 rounded-lg bg-[#3c0212]/10 group-hover:bg-[#3c0212]/20 transition-colors">
                                                        <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" style={{ color: "#3c0212" }} />
                                                    </div>
                                                    <span className="font-medium">
                                                        {formatDate(event.start_date)}
                                                        {event.start_date !== event.end_date && ` - ${formatDate(event.end_date)}`}
                                                    </span>
                                                </div>
                                                {(event.city || event.state) && (
                                                    <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                                                        <div className="p-1.5 rounded-lg bg-[#3c0212]/10 group-hover:bg-[#3c0212]/20 transition-colors">
                                                            <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" style={{ color: "#3c0212" }} />
                                                        </div>
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
                <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fef9fb" }}>
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 lg:mb-16 gap-4 opacity-0 animate-fade-in">
                            <div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 md:mb-3 tracking-tight" style={{ color: "#3c0212" }}>
                                    Store & Courses
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 font-light">Discover spiritual wisdom through books, courses, and digital materials</p>
                            </div>
                            <Link href="/gurukul/materials">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg px-6 py-6 group"
                                    style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                >
                                    View All
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="h-80 rounded-xl bg-gray-200 animate-pulse"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...featuredCourses, ...featuredMaterials].slice(0, 9).map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="opacity-0 animate-fade-in-delay"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <MaterialCard
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Features Section */}
            <FeatureSection />

            <Footer />
        </main>
    )
}
