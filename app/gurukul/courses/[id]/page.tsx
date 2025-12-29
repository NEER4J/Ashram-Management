"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, GraduationCap, Play, Lock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuickSignupDialog } from "@/components/gurukul/quick-signup-dialog"

export default function CourseDetailPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string
    const [course, setCourse] = useState<any>(null)
    const [modules, setModules] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showSignupDialog, setShowSignupDialog] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchCourse = async () => {
            // Check auth
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser)

            const { data: courseData, error: courseError } = await supabase
                .from("study_materials")
                .select(`
                    *,
                    master_material_categories (name)
                `)
                .eq("id", courseId)
                .eq("type", "Course")
                .eq("is_published", true)
                .single()

            if (courseError || !courseData) {
                toast.error("Course not found")
                return
            }

            setCourse(courseData)

            const { data: modulesData } = await supabase
                .from("course_modules")
                .select("*")
                .eq("course_id", courseId)
                .order("order_index", { ascending: true })

            if (modulesData) {
                setModules(modulesData)
            }

            setLoading(false)
        }

        if (courseId) {
            fetchCourse()
        }
    }, [courseId, supabase])

    const handleEnroll = async () => {
        // Check if user is logged in
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
            // Show signup dialog
            setShowSignupDialog(true)
            return
        }
        // Redirect to checkout
        router.push(`/gurukul/checkout?course=${courseId}`)
    }

    const handleSignupSuccess = (userId: string) => {
        // After signup, redirect to checkout
        router.push(`/gurukul/checkout?course=${courseId}`)
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

    if (!course) {
        return (
            <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600 mb-4">Course not found</p>
                        <Link href="/gurukul/courses">
                            <Button style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}>Browse Courses</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        )
    }

    const totalDuration = modules.reduce((sum, m) => sum + (m.duration_minutes || 0), 0)
    const previewModules = modules.filter(m => m.is_preview)

    return (
        <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
            <Header />
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {course.cover_image_url && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                                <img
                                    src={course.cover_image_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="outline">Course</Badge>
                                {course.master_material_categories && (
                                    <Badge variant="secondary">
                                        {course.master_material_categories.name}
                                    </Badge>
                                )}
                                {course.is_free && (
                                    <Badge className="bg-green-600">Free</Badge>
                                )}
                            </div>
                            <h1 className="text-4xl font-semibold text-slate-900 mb-4">
                                {course.title}
                            </h1>
                            {course.author && (
                                <p className="text-lg text-slate-600 mb-4">by {course.author}</p>
                            )}
                        </div>

                        {course.description && (
                            <div>
                                <h2 className="text-2xl font-semibold text-slate-900 mb-4">About This Course</h2>
                                <p className="text-slate-600 whitespace-pre-line">{course.description}</p>
                            </div>
                        )}

                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Course Modules</h2>
                            <div className="space-y-2">
                                {modules.map((module, index) => (
                                    <Card key={module.id} className="border-slate-200">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-slate-900">{module.title}</h3>
                                                            {module.is_preview && (
                                                                <Badge variant="outline" className="text-xs">Preview</Badge>
                                                            )}
                                                        </div>
                                                        {module.description && (
                                                            <p className="text-sm text-slate-600 line-clamp-1">
                                                                {module.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                            <span>{module.content_type}</span>
                                                            {module.duration_minutes && (
                                                                <span>{module.duration_minutes} min</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {module.is_preview ? (
                                                        <Play className="h-5 w-5 text-slate-400" />
                                                    ) : (
                                                        <Lock className="h-5 w-5 text-slate-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {modules.length === 0 && (
                                <p className="text-slate-500 text-center py-8">No modules available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-3xl font-bold text-slate-900 mb-2">
                                            {course.is_free ? (
                                                <span className="text-green-600">Free</span>
                                            ) : (
                                                <>₹{new Intl.NumberFormat("en-IN").format(course.price)}</>
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Modules:</span>
                                            <span className="font-medium">{modules.length}</span>
                                        </div>
                                        {totalDuration > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Total Duration:</span>
                                                <span className="font-medium">{totalDuration} minutes</span>
                                            </div>
                                        )}
                                        {previewModules.length > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Preview Modules:</span>
                                                <span className="font-medium">{previewModules.length}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        size="lg"
                                        onClick={handleEnroll}
                                        className="w-full"
                                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                    >
                                        <GraduationCap className="mr-2 h-5 w-5" />
                                        Enroll
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">What You'll Learn</h3>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    {modules.slice(0, 5).map((module) => (
                                        <li key={module.id} className="flex items-start gap-2">
                                            <GraduationCap className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                                            <span>{module.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
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

