"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MaterialCard } from "@/components/gurukul/material-card"
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
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#3c0212" }}>
                <div className="container mx-auto max-w-6xl text-center">
                    <div className="mb-6">
                        <BookOpen className="h-16 w-16 mx-auto mb-4" style={{ color: "#fef9fb" }} />
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl font-medium mb-6" style={{ color: "#fef9fb" }}>
                        Gurukul - Study Materials
                    </h1>
                    <p className="text-xl md:text-2xl mb-8" style={{ color: "#fef9fb" }}>
                        Discover spiritual wisdom through books, courses, and digital materials
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                        <Input
                            placeholder="Search materials and courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
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
                            style={{ backgroundColor: "#fef9fb", color: "#3c0212" }}
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            {featuredCourses.length > 0 && (
                <section className="py-16 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-semibold text-slate-900">Featured Courses</h2>
                            <Link href="/gurukul/materials?type=Course">
                                <Button variant="outline" style={{ borderColor: "#3c0212", color: "#3c0212" }}>
                                    View All Courses
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredCourses.map((course) => (
                                <MaterialCard
                                    key={course.id}
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
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Materials */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-semibold text-slate-900">Featured Materials</h2>
                        <Link href="/gurukul/materials">
                            <Button variant="outline" style={{ borderColor: "#3c0212", color: "#3c0212" }}>
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                    {featuredMaterials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredMaterials.map((material) => (
                                <MaterialCard
                                    key={material.id}
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
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p>No materials available yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-semibold text-slate-900 mb-8 text-center">Explore by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/gurukul/materials?type=Book">
                            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow text-center cursor-pointer">
                                <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "#3c0212" }} />
                                <p className="font-medium text-slate-900">Books</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/materials?type=PDF">
                            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow text-center cursor-pointer">
                                <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "#3c0212" }} />
                                <p className="font-medium text-slate-900">PDFs</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/materials?type=Video">
                            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow text-center cursor-pointer">
                                <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "#3c0212" }} />
                                <p className="font-medium text-slate-900">Videos</p>
                            </div>
                        </Link>
                        <Link href="/gurukul/courses">
                            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow text-center cursor-pointer">
                                <BookOpen className="h-8 w-8 mx-auto mb-2" style={{ color: "#3c0212" }} />
                                <p className="font-medium text-slate-900">Courses</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}

