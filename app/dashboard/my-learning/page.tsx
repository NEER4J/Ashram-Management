"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, GraduationCap, BookOpen, Download, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function MyLearningPage() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [purchases, setPurchases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push("/auth/login")
                return
            }

            // Fetch enrollments for current user
            const { data: enrollmentsData } = await supabase
                .from("course_enrollments")
                .select(`
                    *,
                    study_materials (
                        id,
                        title,
                        description,
                        cover_image_url,
                        is_free,
                        price
                    )
                `)
                .eq("user_id", user.id)
                .order("enrolled_at", { ascending: false })

            if (enrollmentsData) {
                setEnrollments(enrollmentsData)
            }

            // Fetch purchases for current user
            const { data: ordersData } = await supabase
                .from("study_material_orders")
                .select(`
                    *,
                    order_items (
                        material_id,
                        item_type,
                        study_materials (
                            id,
                            title,
                            description,
                            type,
                            cover_image_url,
                            is_free,
                            price,
                            file_urls
                        )
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (ordersData) {
                const purchasedMaterials = ordersData.flatMap(order =>
                    order.order_items
                        .filter((item: { item_type: string; study_materials: any }) => item.item_type === "Material" && item.study_materials)
                        .map((item: { study_materials: any }) => ({
                            ...item.study_materials,
                            order_date: order.order_date,
                            order_code: order.order_code,
                        }))
                )
                setPurchases(purchasedMaterials)
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Learning</h1>
                    <p className="text-slate-600 mt-1">
                        Access your purchased materials and enrolled courses
                    </p>
                </div>
             
            </div>

            {/* Enrolled Courses */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">My Courses</h2>
                {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {enrollments.map((enrollment) => {
                            const course = enrollment.study_materials
                            if (!course) return null

                            return (
                                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                                    <div className="aspect-video overflow-hidden bg-slate-100">
                                        {course.cover_image_url ? (
                                            <img
                                                src={course.cover_image_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <GraduationCap className="h-12 w-12 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600">Progress</span>
                                                <span className="font-medium">
                                                    {enrollment.progress_percentage?.toFixed(0) || 0}%
                                                </span>
                                            </div>
                                            <Progress value={enrollment.progress_percentage || 0} />
                                        </div>
                                        <Button
                                            className="w-full"
                                            onClick={() => router.push(`/dashboard/my-learning/courses/${course.id}`)}
                                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Continue Learning
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-600 mb-4">You haven't enrolled in any courses yet.</p>
                            <Link href="/gurukul">
                                <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                                    Browse Courses
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Purchased Materials */}
            <div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">My Purchases</h2>
                {purchases.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {purchases.map((material) => (
                            <Card 
                                key={material.id} 
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.push(`/dashboard/my-learning/materials/${material.id}`)}
                            >
                                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                                    {material.cover_image_url ? (
                                        <img
                                            src={material.cover_image_url}
                                            alt={material.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-slate-300" />
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                                        {material.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">{material.type}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/dashboard/my-learning/materials/${material.id}`)
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-600 mb-4">You haven't purchased any materials yet.</p>
                            <Link href="/gurukul">
                                <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>
                                    Browse Materials
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

