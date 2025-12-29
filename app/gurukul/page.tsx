"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MaterialCard } from "@/components/gurukul/material-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function GurukulHomePage() {
    const [featuredMaterials, setFeaturedMaterials] = useState<any[]>([])
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const supabase = createClient()

    useEffect(() => {
        const fetchFeatured = async () => {
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
        }
        fetchFeatured()
    }, [supabase])

    return (
        <main className="min-h-screen" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            {/* Hero Section */}
            <section className="relative py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: "#3c0212" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                <div className="container mx-auto max-w-6xl text-center relative z-10">
                    <div className="opacity-0 animate-fade-in">
                        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight tracking-tight" style={{ color: "#fef9fb" }}>
                            Gurukul - Study Materials
                        </h1>
                        <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-light" style={{ color: "#fef9fb", opacity: 0.95 }}>
                            Discover spiritual wisdom through books, courses, and digital materials
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <Input
                                placeholder="Search materials and courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 rounded-xl h-12 text-base"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery) {
                                        window.location.href = `/gurukul/materials?search=${encodeURIComponent(searchQuery)}`
                                    }
                                }}
                            />
                            <Button
                                onClick={() => {
                                    if (searchQuery) {
                                        window.location.href = `/gurukul/materials?search=${encodeURIComponent(searchQuery)}`
                                    }
                                }}
                                className="rounded-xl h-12 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
                                style={{ backgroundColor: "#fef9fb", color: "#3c0212" }}
                            >
                                <Search className="mr-2 h-5 w-5" />
                                Search
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            {featuredCourses.length > 0 && (
                <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 lg:mb-16 gap-4 opacity-0 animate-fade-in">
                            <div>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 md:mb-3 tracking-tight" style={{ color: "#3c0212" }}>
                                    Featured Courses
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 font-light">Discover our spiritual courses</p>
                            </div>
                            <Link href="/gurukul/materials?type=Course">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg px-6 py-6 group"
                                    style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                >
                                    View All Courses
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCourses.map((course, index) => (
                                <div
                                    key={course.id}
                                    className="opacity-0 animate-fade-in-delay"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <MaterialCard
                                        id={course.id}
                                        title={course.title}
                                        description={course.description}
                                        type={course.type}
                                        price={course.price}
                                        is_free={course.is_free}
                                        cover_image_url={course.cover_image_url}
                                        author={course.author}
                                        category={course.master_material_categories?.name}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Materials */}
            <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fef9fb" }}>
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 lg:mb-16 gap-4 opacity-0 animate-fade-in">
                        <div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-2 md:mb-3 tracking-tight" style={{ color: "#3c0212" }}>
                                    Featured Materials
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 font-light">Explore our collection of spiritual materials</p>
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
                    {featuredMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredMaterials.map((material, index) => (
                                <div
                                    key={material.id}
                                    className="opacity-0 animate-fade-in-delay"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <MaterialCard
                                        id={material.id}
                                        title={material.title}
                                        description={material.description}
                                        type={material.type}
                                        price={material.price}
                                        is_free={material.is_free}
                                        cover_image_url={material.cover_image_url}
                                        author={material.author}
                                        category={material.master_material_categories?.name}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 md:py-16">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg text-gray-600">No materials available yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-8 md:mb-12 text-center tracking-tight" style={{ color: "#3c0212" }}>
                        Explore by Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <Link href="/gurukul/materials?type=Book">
                            <div className="p-6 md:p-8 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center cursor-pointer group" style={{ borderColor: "#e5e5e5", backgroundColor: "#fef9fb" }}>
                                <BookOpen className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 transition-transform group-hover:scale-110" style={{ color: "#3c0212" }} />
                                <p className="font-semibold text-base md:text-lg" style={{ color: "#3c0212" }}>Books</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/materials?type=PDF">
                            <div className="p-6 md:p-8 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center cursor-pointer group" style={{ borderColor: "#e5e5e5", backgroundColor: "#fef9fb" }}>
                                <BookOpen className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 transition-transform group-hover:scale-110" style={{ color: "#3c0212" }} />
                                <p className="font-semibold text-base md:text-lg" style={{ color: "#3c0212" }}>PDFs</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/materials?type=Video">
                            <div className="p-6 md:p-8 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center cursor-pointer group" style={{ borderColor: "#e5e5e5", backgroundColor: "#fef9fb" }}>
                                <BookOpen className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 transition-transform group-hover:scale-110" style={{ color: "#3c0212" }} />
                                <p className="font-semibold text-base md:text-lg" style={{ color: "#3c0212" }}>Videos</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/courses">
                            <div className="p-6 md:p-8 border-2 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center cursor-pointer group" style={{ borderColor: "#e5e5e5", backgroundColor: "#fef9fb" }}>
                                <BookOpen className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 transition-transform group-hover:scale-110" style={{ color: "#3c0212" }} />
                                <p className="font-semibold text-base md:text-lg" style={{ color: "#3c0212" }}>Courses</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    )
}

