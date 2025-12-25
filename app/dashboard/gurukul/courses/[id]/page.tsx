"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { CourseBuilder } from "@/components/gurukul/course-builder"
import { toast } from "sonner"

export default function CourseEditPage() {
    const params = useParams()
    const router = useRouter()
    const courseId = params.id as string
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchCourse = async () => {
            const { data: courseData, error: courseError } = await supabase
                .from("study_materials")
                .select("*")
                .eq("id", courseId)
                .eq("type", "Course")
                .single()

            if (courseError || !courseData) {
                toast.error("Course not found")
                router.push("/dashboard/gurukul/courses")
                return
            }

            setCourse(courseData)
            setLoading(false)
        }

        if (courseId) {
            fetchCourse()
        }
    }, [courseId, supabase, router])

    const handleSave = async (courseData: any) => {
        try {
            const { error } = await supabase
                .from("study_materials")
                .update(courseData)
                .eq("id", courseId)

            if (error) throw error

            toast.success("Course updated successfully")
            setCourse({ ...course, ...courseData })
        } catch (error) {
            console.error("Error updating course:", error)
            throw error
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        )
    }

    if (!course) {
        return null
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/gurukul/courses")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit Course</h1>
                <p className="text-slate-600 mt-1">
                    Update course information and manage modules
                </p>
            </div>

            <CourseBuilder
                courseId={courseId}
                initialData={course}
                onSave={handleSave}
                mode="edit"
            />
        </div>
    )
}

