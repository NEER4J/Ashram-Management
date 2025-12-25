"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { LessonPlayer } from "@/components/gurukul/lesson-player"
import { CourseSidebar } from "@/components/gurukul/course-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ArrowLeft, Award, Video } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { formatDuration, VideoType } from "@/lib/utils/video-embed"

type Lesson = {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string | null
  video_type: string | null
  video_duration_seconds: number | null
  order_index: number
  is_active: boolean
}

type LessonProgress = {
  lesson_id: string
  is_completed: boolean
  progress_percentage: number
}

export default function CourseLearningPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<any>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("study_materials")
        .select("*")
        .eq("id", courseId)
        .eq("type", "Course")
        .single()

      if (courseError || !courseData) {
        toast.error("Course not found")
        router.push("/dashboard/my-learning")
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

      // Fetch all lessons for this course
      if (modulesData && modulesData.length > 0) {
        const moduleIds = modulesData.map(m => m.id)
        const { data: lessonsData } = await supabase
          .from("course_lessons")
          .select("*")
          .in("module_id", moduleIds)
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (lessonsData) {
          setLessons(lessonsData)
        }
      }

      // Fetch enrollment for current user
      const { data: enrollmentData } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (enrollmentData) {
        setEnrollment(enrollmentData)

        // Fetch lesson progress
        const { data: progressData } = await supabase
          .from("user_lesson_progress")
          .select("lesson_id, is_completed, progress_percentage")
          .eq("enrollment_id", enrollmentData.id)

        if (progressData) {
          setLessonProgress(progressData)
        }

        // Restore last accessed lesson or select first lesson
        if (enrollmentData.last_accessed_lesson_id) {
          const lastLesson = lessons.find(l => l.id === enrollmentData.last_accessed_lesson_id)
          if (lastLesson) {
            setSelectedLesson(lastLesson)
            setExpandedModules(new Set([lastLesson.module_id]))
          } else if (lessons.length > 0) {
            setSelectedLesson(lessons[0])
            setExpandedModules(new Set([lessons[0].module_id]))
          }
        } else if (lessons.length > 0) {
          setSelectedLesson(lessons[0])
          setExpandedModules(new Set([lessons[0].module_id]))
        }
      } else {
        toast.error("You are not enrolled in this course")
        router.push("/dashboard/my-learning")
        return
      }

      setLoading(false)
    }

    if (courseId) {
      fetchData()
    }
  }, [courseId, supabase, router])

  const handleLessonSelect = async (lesson: { id: string; module_id: string; title: string; video_duration_seconds: number | null; order_index: number; is_active: boolean }) => {
    // Find the full lesson data
    const fullLesson = lessons.find(l => l.id === lesson.id)
    if (fullLesson) {
      setSelectedLesson(fullLesson)
      setExpandedModules(prev => new Set([...prev, fullLesson.module_id]))

      // Update last accessed lesson
      if (enrollment) {
        await supabase
          .from("course_enrollments")
          .update({ last_accessed_lesson_id: fullLesson.id })
          .eq("id", enrollment.id)
      }
    }
  }

  const handleProgressUpdate = async (progress: number) => {
    // Progress is updated by LessonPlayer component
    // This callback can be used for additional actions if needed
  }

  const handleLessonComplete = async () => {
    // Refresh progress data
    if (enrollment) {
      const { data: progressData } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id, is_completed, progress_percentage")
        .eq("enrollment_id", enrollment.id)

      if (progressData) {
        setLessonProgress(progressData)
      }

      // Auto-advance to next lesson
      const currentIndex = lessons.findIndex(l => l.id === selectedLesson?.id)
      if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
        const nextLesson = lessons[currentIndex + 1]
        // Check if next lesson is unlocked (first lesson in module or previous completed)
        const moduleLessons = lessons
          .filter(l => l.module_id === nextLesson.module_id)
          .sort((a, b) => a.order_index - b.order_index)
        const nextIndex = moduleLessons.findIndex(l => l.id === nextLesson.id)

        if (nextIndex === 0) {
          // First lesson in module, always unlocked
          handleLessonSelect(nextLesson)
        } else {
          // Check if previous lessons are completed
          const previousLessons = moduleLessons.slice(0, nextIndex)
          const allPreviousCompleted = previousLessons.every(l => {
            const progress = lessonProgress.find(p => p.lesson_id === l.id)
            return progress?.is_completed
          })

          if (allPreviousCompleted) {
            handleLessonSelect(nextLesson)
          }
        }
      }
    }
  }

  const calculateCourseProgress = (): number => {
    if (lessons.length === 0) return 0
    const completedCount = lessons.filter(lesson =>
      lessonProgress.find(p => p.lesson_id === lesson.id)?.is_completed
    ).length
    return (completedCount / lessons.length) * 100
  }

  const calculateTotalDuration = (): number => {
    return lessons.reduce((total, lesson) => total + (lesson.video_duration_seconds || 0), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  if (!course || !enrollment) {
    return null
  }

  const isCompleted = enrollment.progress_percentage >= 100

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen relative">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          <div className="mb-4 sm:mb-6">
            <Link href="/dashboard/my-learning">
              <Button variant="ghost" size="sm" className="text-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to My Learning</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>

          {isCompleted && (
            <Card className="border-green-200 bg-green-50 mb-4 sm:mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                  <Award className="h-8 w-8 sm:h-12 sm:w-12 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-green-900 mb-1">
                      Congratulations! Course Completed
                    </h3>
                    <p className="text-sm sm:text-base text-green-700">
                      You have successfully completed all lessons in this course.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedLesson ? (
            <LessonPlayer
              lesson={{
                id: selectedLesson.id,
                title: selectedLesson.title,
                description: selectedLesson.description,
                video_url: selectedLesson.video_url,
                video_type: (selectedLesson.video_type as VideoType) || null,
                video_duration_seconds: selectedLesson.video_duration_seconds,
              }}
              enrollmentId={enrollment.id}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleLessonComplete}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="text-center max-w-md mx-auto px-4 sm:px-6">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                  style={{ backgroundColor: "#fef9fb" }}
                >
                  <Video className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: "#3c0212" }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 sm:mb-3">
                  Welcome to the Course
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Select a lesson from the course outline to begin your learning journey. Track
                  your progress as you complete each lesson.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Sidebar */}
      <CourseSidebar
        courseTitle={course.title}
        modules={modules}
        lessons={lessons}
        lessonProgress={lessonProgress}
        selectedLessonId={selectedLesson?.id || null}
        expandedModules={expandedModules}
        totalDuration={calculateTotalDuration()}
        courseProgress={calculateCourseProgress()}
        onLessonSelect={handleLessonSelect}
        onToggleModule={(moduleId) => {
          setExpandedModules(prev => {
            const newSet = new Set(prev)
            if (newSet.has(moduleId)) {
              newSet.delete(moduleId)
            } else {
              newSet.add(moduleId)
            }
            return newSet
          })
        }}
      />
    </div>
  )
}
