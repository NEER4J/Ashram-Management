"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Download, BookOpen, Calendar, FileText, User, Globe, Package } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function MaterialDetailPage() {
    const params = useParams()
    const router = useRouter()
    const materialId = params.id as string
    const [material, setMaterial] = useState<any>(null)
    const [orderInfo, setOrderInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth/login")
                return
            }

            // Fetch material details
            const { data: materialData, error: materialError } = await supabase
                .from("study_materials")
                .select("*")
                .eq("id", materialId)
                .single()

            if (materialError || !materialData) {
                toast.error("Material not found")
                router.push("/dashboard/my-learning")
                return
            }

            setMaterial(materialData)

            // Check if user has purchased this material
            const { data: ordersData } = await supabase
                .from("study_material_orders")
                .select(`
                    *,
                    order_items (
                        material_id,
                        item_type,
                        study_materials (id)
                    )
                `)
                .eq("user_id", user.id)
                .eq("status", "Delivered")

            if (ordersData) {
                const hasPurchased = ordersData.some(order =>
                    order.order_items.some((item: any) =>
                        item.item_type === "Material" && item.study_materials?.id === materialId
                    )
                )

                if (hasPurchased) {
                    setHasAccess(true)
                    // Get order info for this material
                    const order = ordersData.find(o =>
                        o.order_items.some((item: any) =>
                            item.item_type === "Material" && item.study_materials?.id === materialId
                        )
                    )
                    if (order) {
                        setOrderInfo(order)
                    }
                } else {
                    // Check if it's free
                    if (materialData.is_free) {
                        setHasAccess(true)
                    } else {
                        toast.error("You don't have access to this material")
                        router.push("/dashboard/my-learning")
                        return
                    }
                }
            } else if (materialData.is_free) {
                setHasAccess(true)
            } else {
                toast.error("You don't have access to this material")
                router.push("/dashboard/my-learning")
                return
            }

            setLoading(false)
        }

        if (materialId) {
            fetchData()
        }
    }, [materialId, supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        )
    }

    if (!material || !hasAccess) {
        return null
    }

    const purchaseDate = orderInfo?.order_date
        ? new Date(orderInfo.order_date).toLocaleDateString()
        : null

    return (
        <div className="h-full flex-1 flex-col space-y-6 p-6 md:p-8">
            <div className="mb-6">
                <Link href="/dashboard/my-learning">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to My Learning
                    </Button>
                </Link>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Material Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Cover Image */}
                    <Card className="overflow-hidden">
                        <div className="aspect-video bg-slate-100">
                            {material.cover_image_url ? (
                                <img
                                    src={material.cover_image_url}
                                    alt={material.title}
                                    className="w-full h-full max-h-[400px] object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="h-24 w-24 text-slate-300" />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Description */}
                    {material.description && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                                        {material.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Files Section */}
                    {material.file_urls && material.file_urls.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Download Files
                                </h2>
                                <div className="space-y-3">
                                    {material.file_urls.map((url: string, index: number) => {
                                        const fileName = url.split('/').pop() || `File ${index + 1}`
                                        return (
                                            <a
                                                key={index}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="h-5 w-5 text-slate-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 truncate">
                                                            {fileName}
                                                        </p>
                                                        <p className="text-sm text-slate-500 truncate">
                                                            {url}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="ml-4 flex-shrink-0"
                                                    style={{ borderColor: "#3c0212", color: "#3c0212" }}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </a>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Material Info Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                                        {material.title}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                        <Badge variant="outline">{material.type}</Badge>
                                        {material.is_free && (
                                            <Badge className="bg-green-600">Free</Badge>
                                        )}
                                    </div>
                                </div>

                                {material.author && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-slate-500" />
                                        <span className="text-slate-600">Author:</span>
                                        <span className="font-medium text-slate-900">{material.author}</span>
                                    </div>
                                )}

                                {material.language && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-slate-500" />
                                        <span className="text-slate-600">Language:</span>
                                        <span className="font-medium text-slate-900">{material.language}</span>
                                    </div>
                                )}

                                {material.type === "Book" && !material.is_digital && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-slate-500" />
                                        <span className="text-slate-600">Stock:</span>
                                        <span className="font-medium text-slate-900">
                                            {material.stock_quantity} available
                                        </span>
                                    </div>
                                )}

                                {!material.is_free && (
                                    <div className="pt-2 border-t border-slate-200">
                                        <div className="text-2xl font-bold text-slate-900">
                                            ₹{new Intl.NumberFormat("en-IN").format(material.price)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Purchase Info Card */}
                    {orderInfo && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Purchase Information</h3>
                                <div className="space-y-3">
                                    {purchaseDate && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-slate-500" />
                                            <span className="text-slate-600">Purchased:</span>
                                            <span className="font-medium text-slate-900">{purchaseDate}</span>
                                        </div>
                                    )}
                                    {orderInfo.order_code && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-600">Order Code:</span>
                                            <span className="font-medium text-slate-900 font-mono">
                                                {orderInfo.order_code}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-slate-600">Status:</span>
                                        <Badge
                                            variant={orderInfo.status === "Delivered" ? "default" : "secondary"}
                                            className={
                                                orderInfo.status === "Delivered"
                                                    ? "bg-green-600"
                                                    : ""
                                            }
                                        >
                                            {orderInfo.status}
                                        </Badge>
                                    </div>
                                    {orderInfo.payment_status && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-600">Payment:</span>
                                            <Badge
                                                variant={orderInfo.payment_status === "Paid" ? "default" : "secondary"}
                                                className={
                                                    orderInfo.payment_status === "Paid"
                                                        ? "bg-green-600"
                                                        : ""
                                                }
                                            >
                                                {orderInfo.payment_status}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Free Material Badge */}
                    {material.is_free && !orderInfo && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-600">Free Material</Badge>
                                    <span className="text-sm text-green-700">
                                        This material is available for free
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

