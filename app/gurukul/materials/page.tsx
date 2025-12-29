"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MaterialCard } from "@/components/gurukul/material-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Search, Filter } from "lucide-react"

function MaterialsCatalogPageContent() {
    const searchParams = useSearchParams()
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
    const [selectedType, setSelectedType] = useState(searchParams.get("type") || "all")
    const [sortBy, setSortBy] = useState("newest")
    const supabase = createClient()

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true)
            let query = supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("is_published", true)

            if (selectedType !== "all") {
                query = query.eq("type", selectedType)
            }

            if (searchQuery) {
                query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
            }

            // Sort
            if (sortBy === "newest") {
                query = query.order("created_at", { ascending: false })
            } else if (sortBy === "oldest") {
                query = query.order("created_at", { ascending: true })
            } else if (sortBy === "price-low") {
                query = query.order("price", { ascending: true })
            } else if (sortBy === "price-high") {
                query = query.order("price", { ascending: false })
            } else if (sortBy === "title") {
                query = query.order("title", { ascending: true })
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching materials:", error)
            } else if (data) {
                setMaterials(data)
            }
            setLoading(false)
        }

        fetchMaterials()
    }, [supabase, selectedType, searchQuery, sortBy])

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            {/* Hero Section */}
            <section className="relative py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: "#3c0212" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="opacity-0 animate-fade-in">
                        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight tracking-tight text-center" style={{ color: "#fef9fb" }}>
                            Study Materials & Courses Catalog
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed font-light" style={{ color: "#fef9fb", opacity: 0.95 }}>
                            Browse our collection of spiritual books, courses, and digital materials
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 flex-1">
                <div className="container mx-auto max-w-7xl">

                    {/* Filters */}
                    <div className="mb-8 md:mb-12 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Search materials and courses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-12 rounded-xl text-base"
                                    />
                                </div>
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Book">Books</SelectItem>
                                    <SelectItem value="PDF">PDFs</SelectItem>
                                    <SelectItem value="Video">Videos</SelectItem>
                                    <SelectItem value="Audio">Audio</SelectItem>
                                    <SelectItem value="Course">Courses</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[180px] h-12 rounded-xl">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="title">Title A-Z</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="text-center py-12 md:py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading materials...</p>
                        </div>
                    ) : materials.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {materials.map((material, index) => (
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
                            <p className="text-lg text-gray-600">No materials found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    )
}

export default function MaterialsCatalogPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
                <Header />
                <div className="flex-1 flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3c0212] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading materials...</p>
                    </div>
                </div>
                <Footer />
            </main>
        }>
            <MaterialsCatalogPageContent />
        </Suspense>
    )
}

