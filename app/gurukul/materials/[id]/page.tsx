"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ShoppingCart, Download, BookOpen } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuickSignupDialog } from "@/components/gurukul/quick-signup-dialog"

export default function MaterialDetailPage() {
    const params = useParams()
    const router = useRouter()
    const materialId = params.id as string
    const [material, setMaterial] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [relatedMaterials, setRelatedMaterials] = useState<any[]>([])
    const [showSignupDialog, setShowSignupDialog] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchMaterial = async () => {
            // Check auth
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser)

            const { data, error } = await supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("id", materialId)
                .eq("is_published", true)
                .single()

            if (error || !data) {
                toast.error("Material not found")
                return
            }

            setMaterial(data)

            // Fetch related materials
            const { data: related } = await supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("is_published", true)
                .eq("type", data.type)
                .neq("id", materialId)
                .limit(4)

            if (related) {
                setRelatedMaterials(related)
            }

            setLoading(false)
        }

        if (materialId) {
            fetchMaterial()
        }
    }, [materialId, supabase])

    const handlePurchase = async () => {
        // Check if user is logged in
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
            // Show signup dialog
            setShowSignupDialog(true)
            return
        }
        // Redirect to checkout with this material
        router.push(`/gurukul/checkout?material=${materialId}`)
    }

    const handleSignupSuccess = (userId: string) => {
        // After signup, redirect to checkout
        router.push(`/gurukul/checkout?material=${materialId}`)
    }

    if (loading) {
        return (
            <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#3c0212" }} />
                </div>
                <Footer />
            </main>
        )
    }

    if (!material) {
        return (
            <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Material not found</p>
                        <Link href="/gurukul/materials">
                            <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>Browse Materials</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Image */}
                    <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
                        {material.cover_image_url ? (
                            <img
                                src={material.cover_image_url}
                                alt={material.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-24 w-24 text-slate-300" />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{material.type}</Badge>
                                {material.master_material_categories && (
                                    <Badge variant="secondary">
                                        {material.master_material_categories.name}
                                    </Badge>
                                )}
                                {material.is_free && (
                                    <Badge className="bg-green-600">Free</Badge>
                                )}
                            </div>
                            <h1 className="text-4xl font-semibold text-slate-900 mb-4">
                                {material.title}
                            </h1>
                            {material.author && (
                                <p className="text-lg text-slate-600 mb-4">by {material.author}</p>
                            )}
                        </div>

                        <div>
                            <p className="text-3xl font-bold text-slate-900 mb-6">
                                {material.is_free ? (
                                    <span className="text-green-600">Free</span>
                                ) : (
                                    <>₹{new Intl.NumberFormat("en-IN").format(material.price)}</>
                                )}
                            </p>
                        </div>

                        {material.description && (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                <p className="text-slate-600 whitespace-pre-line">{material.description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {material.language && (
                                <div>
                                    <span className="font-medium text-slate-600">Language: </span>
                                    <span className="text-slate-900">{material.language}</span>
                                </div>
                            )}
                            {material.type === "Book" && !material.is_digital && (
                                <div>
                                    <span className="font-medium text-slate-600">Stock: </span>
                                    <span className="text-slate-900">{material.stock_quantity} available</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                size="lg"
                                onClick={handlePurchase}
                                className="flex-1"
                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Get This
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Related Materials */}
                {relatedMaterials.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Related Materials</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedMaterials.map((related) => (
                                <Link
                                    key={related.id}
                                    href={related.type === "Course" ? `/gurukul/courses/${related.id}` : `/gurukul/materials/${related.id}`}
                                >
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                            {related.cover_image_url ? (
                                                <img
                                                    src={related.cover_image_url}
                                                    alt={related.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen className="h-12 w-12 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4">
                                            <h3 className="font-semibold mb-2 line-clamp-2">{related.title}</h3>
                                            <p className="text-sm font-bold">
                                                {related.is_free ? (
                                                    <span className="text-green-600">Free</span>
                                                ) : (
                                                    <>₹{new Intl.NumberFormat("en-IN").format(related.price)}</>
                                                )}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <QuickSignupDialog
                open={showSignupDialog}
                onOpenChange={setShowSignupDialog}
                onSuccess={handleSignupSuccess}
            />
            </div>
            <Footer />
        </main>
    )
}

