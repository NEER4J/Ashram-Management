"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { CourseBuilder } from "@/components/gurukul/course-builder"
import { Loader2 } from "lucide-react"

export default function NewCoursePage() {
    const router = useRouter()
    const supabase = createClient()

    const handleSave = async (courseData: any) => {
        try {
            // Create course with type="Course"
            const coursePayload = {
                ...courseData,
                type: "Course",
            }

            const { data: course, error } = await supabase
                .from("study_materials")
                .insert(coursePayload)
                .select()
                .single()

            if (error) throw error

            // Redirect to edit page to manage modules
            router.push(`/dashboard/gurukul/courses/${course.id}`)
        } catch (error) {
            console.error("Error creating course:", error)
            throw error
        }
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create New Course</h1>
                <p className="text-slate-600 mt-1">
                    Build your course with modules and lessons
                </p>
            </div>

            <CourseBuilder
                onSave={handleSave}
                mode="create"
            />
        </div>
    )
}

