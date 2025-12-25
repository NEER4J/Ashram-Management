"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CoursePlayer } from "@/components/gurukul/course-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Award } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CourseLearningPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string
    const [course, setCourse] = useState<any>(null)
    const [modules, setModules] = useState<any[]>([])
    const [enrollment, setEnrollment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            // Fetch course
            const { data: courseData, error: courseError } = await supabase
                .from("study_materials")
                .select("*")
                .eq("id", courseId)
                .eq("type", "Course")
                .single()

            if (courseError || !courseData) {
                toast.error("Course not found")
                router.push("/gurukul/my-learning")
                return
            }

            setCourse(courseData)

            // Fetch modules
            const { data: modulesData } = await supabase
                .from("course_modules")
                .select("*")
                .eq("course_id", courseId)
                .order("order_index", { ascending: true })

            if (modulesData) {
                setModules(modulesData)
            }

            // Fetch enrollment (simplified - in production, filter by user's devotee_id)
            const { data: enrollmentData } = await supabase
                .from("course_enrollments")
                .select("*")
                .eq("course_id", courseId)
                .limit(1)
                .maybeSingle()

            if (enrollmentData) {
                setEnrollment(enrollmentData)
            } else {
                toast.error("You are not enrolled in this course")
                router.push("/gurukul/my-learning")
                return
            }

            setLoading(false)
        }

        if (courseId) {
            fetchData()
        }
    }, [courseId, supabase, router])

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#fbf9ef" }}>
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </main>
        )
    }

    if (!course || !enrollment) {
        return null
    }

    const isCompleted = enrollment.progress_percentage >= 100

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#fbf9ef" }}>
            <div className="container mx-auto max-w-7xl">
                <div className="mb-6">
                    <Link href="/gurukul/my-learning">
                        <Button variant="ghost">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to My Learning
                        </Button>
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-semibold text-slate-900 mb-2">{course.title}</h1>
                    <p className="text-slate-600">Continue your learning journey</p>
                </div>

                {isCompleted && (
                    <Card className="mb-6 border-green-200 bg-green-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Award className="h-12 w-12 text-green-600" />
                                <div>
                                    <h3 className="text-xl font-semibold text-green-900 mb-1">
                                        Congratulations! Course Completed
                                    </h3>
                                    <p className="text-green-700">
                                        You have successfully completed all modules in this course.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <CoursePlayer
                    courseId={courseId}
                    enrollmentId={enrollment.id}
                    modules={modules}
                />
            </div>
        </main>
    )
}

