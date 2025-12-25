"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  PlayCircle,
  Clock,
  X,
  Menu,
} from "lucide-react"
import { formatDuration } from "@/lib/utils/video-embed"
import { cn } from "@/lib/utils"

type Module = {
  id: string
  title: string
  description: string | null
  order_index: number
}

type Lesson = {
  id: string
  module_id: string
  title: string
  video_duration_seconds: number | null
  order_index: number
  is_active: boolean
}

type LessonProgress = {
  lesson_id: string
  is_completed: boolean
  progress_percentage: number
}

interface CourseSidebarProps {
  courseTitle: string
  modules: Module[]
  lessons: Lesson[]
  lessonProgress: LessonProgress[]
  selectedLessonId: string | null
  expandedModules: Set<string>
  totalDuration: number
  courseProgress: number
  onLessonSelect: (lesson: Lesson) => void
  onToggleModule: (moduleId: string) => void
  onBack?: () => void
  showBackButton?: boolean
}

export function CourseSidebar({
  courseTitle,
  modules,
  lessons,
  lessonProgress,
  selectedLessonId,
  expandedModules,
  totalDuration,
  courseProgress,
  onLessonSelect,
  onToggleModule,
  onBack,
  showBackButton = false,
}: CourseSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const getModuleLessons = (moduleId: string) => {
    return lessons
      .filter(lesson => lesson.module_id === moduleId && lesson.is_active)
      .sort((a, b) => a.order_index - b.order_index)
  }

  const getLessonProgress = (lessonId: string): LessonProgress | undefined => {
    return lessonProgress.find(p => p.lesson_id === lessonId)
  }

  const isLessonUnlocked = (lesson: Lesson): boolean => {
    const moduleLessons = getModuleLessons(lesson.module_id)
    const lessonIndex = moduleLessons.findIndex(l => l.id === lesson.id)

    if (lessonIndex === 0) return true

    const previousLessons = moduleLessons.slice(0, lessonIndex)
    return previousLessons.every(l => getLessonProgress(l.id)?.is_completed)
  }

  const calculateModuleProgress = (moduleId: string): number => {
    const moduleLessons = getModuleLessons(moduleId)
    if (moduleLessons.length === 0) return 0

    const completedCount = moduleLessons.filter(l =>
      getLessonProgress(l.id)?.is_completed
    ).length

    return (completedCount / moduleLessons.length) * 100
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-16 sm:top-20 right-4 z-50 lg:hidden bg-white border border-slate-200 rounded-full p-2.5 sm:p-3 shadow-lg hover:bg-slate-100 transition-colors"
        style={{ borderColor: "#3c0212" }}
        aria-label="Toggle course sidebar"
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5 text-slate-600" />
        ) : (
          <Menu className="h-5 w-5 text-slate-600" />
        )}
      </button>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-full sm:w-[380px] lg:w-[420px] h-screen bg-white border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
          "lg:sticky lg:top-0 lg:h-auto",
          "fixed top-0 right-0 z-40",
          isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        style={{ borderColor: "#3c0212" }}
      >
        <div className="flex flex-col h-full">
          {/* Course Header */}
          <div
            className="py-4 px-4 sm:px-5 border-b flex-shrink-0"
            style={{ backgroundColor: "#fef9fb", borderColor: "#3c0212" }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 truncate">{courseTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-white/50 rounded-md transition-colors flex-shrink-0"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>
                  {lessons.filter(l => getLessonProgress(l.id)?.is_completed).length} of{" "}
                  {lessons.length} lessons complete
                </span>
                <span className="font-semibold">{Math.round(courseProgress)}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={courseProgress} 
                  className="h-2 bg-slate-200"
                  style={{
                    backgroundColor: "#e2e8f0"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Modules and Lessons */}
          <ScrollArea className="flex-1 h-0">
            <div className="py-0">
              {modules
                .sort((a, b) => a.order_index - b.order_index)
                .map((module, moduleIndex) => {
                  const moduleLessons = getModuleLessons(module.id)
                  const isExpanded = expandedModules.has(module.id)
                  const completedCount = moduleLessons.filter(l =>
                    getLessonProgress(l.id)?.is_completed
                  ).length
                  const totalDuration = moduleLessons.reduce(
                    (acc, lesson) => acc + (lesson.video_duration_seconds || 0),
                    0
                  )
                  const moduleProgress = calculateModuleProgress(module.id)

                  return (
                    <div key={module.id} className="border-b border-slate-200 last:border-b-0">
                      {/* Module Header */}
                      <button
                        onClick={() => onToggleModule(module.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 transition-all text-left",
                          isExpanded 
                            ? "bg-slate-50" 
                            : "bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                            style={{ 
                              backgroundColor: isExpanded ? "#3c0212" : "#fef9fb", 
                              color: isExpanded ? "#fef9fb" : "#3c0212"
                            }}
                          >
                            {moduleIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{module.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{completedCount} of {moduleLessons.length} lessons</span>
                              {totalDuration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(totalDuration)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-center flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Lessons */}
                      {isExpanded && (
                        <div className="bg-white">
                          {moduleLessons.map((lesson, lessonIndex) => {
                            const lessonProgressData = getLessonProgress(lesson.id)
                            const isUnlocked = isLessonUnlocked(lesson)
                            const isSelected = selectedLessonId === lesson.id

                            return (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  if (isUnlocked) {
                                    onLessonSelect(lesson)
                                    setIsSidebarOpen(false) // Close on mobile
                                  }
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3.5 text-left transition-all border-b border-slate-100 last:border-b-0",
                                  isSelected
                                    ? "bg-[#fef9fb] border-l-2"
                                    : "hover:bg-slate-50",
                                  !isUnlocked && "opacity-60 cursor-not-allowed",
                                  isSelected && "border-l-[#3c0212]"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    {lessonProgressData?.is_completed ? (
                                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      </div>
                                    ) : isUnlocked ? (
                                      <div 
                                        className="w-6 h-6 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: isSelected ? "#3c0212" : "#fef9fb" }}
                                      >
                                        <PlayCircle 
                                          className="w-4 h-4" 
                                          style={{ color: isSelected ? "#fef9fb" : "#3c0212" }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={cn(
                                        "text-sm mb-1",
                                        isSelected 
                                          ? "text-[#3c0212] font-semibold" 
                                          : isUnlocked 
                                            ? "text-slate-900 font-medium" 
                                            : "text-slate-500",
                                        !isUnlocked && "line-through"
                                      )}
                                    >
                                      {lesson.title}
                                    </h4>
                                    {lesson.video_duration_seconds && lesson.video_duration_seconds > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span>{formatDuration(lesson.video_duration_seconds)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}

