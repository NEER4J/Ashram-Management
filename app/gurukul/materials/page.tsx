"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MaterialCard } from "@/components/gurukul/material-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-semibold text-slate-900 mb-4">Study Materials & Courses Catalog</h1>
                    <p className="text-slate-600">Browse our collection of spiritual books, courses, and digital materials</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search materials and courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                            <SelectTrigger className="w-full sm:w-[180px]">
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
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading materials...</p>
                    </div>
                ) : materials.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {materials.map((material) => (
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
                    <div className="text-center py-12">
                        <p className="text-slate-500">No materials found matching your criteria.</p>
                    </div>
                )}
            </div>
        </main>
    )
}

export default function MaterialsCatalogPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
                <div className="text-center py-12">
                    <p className="text-slate-500">Loading materials...</p>
                </div>
            </main>
        }>
            <MaterialsCatalogPageContent />
        </Suspense>
    )
}

