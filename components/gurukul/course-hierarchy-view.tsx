"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Edit, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  Video,
  Clock,
  Lock,
  Unlock,
  PlayCircle
} from "lucide-react"
import { formatDuration } from "@/lib/utils/video-embed"

type Course = {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  is_published: boolean
  created_at: string
}

type Module = {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  is_active?: boolean
  created_at: string
}

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
  created_at: string
}

interface CourseHierarchyViewProps {
  courses: Course[]
  modules: Module[]
  lessons: Lesson[]
  selectedCourse: Course | null
  selectedModule: Module | null
  currentView: 'courses' | 'modules' | 'lessons'
  expandedModules: Set<string>
  onCourseSelect: (course: Course) => void
  onModuleSelect: (module: Module) => void
  onViewChange: (view: 'courses' | 'modules' | 'lessons') => void
  onToggleModule: (moduleId: string) => void
  onCourseEdit: (course: Course) => void
  onCourseDelete: (course: Course) => void
  onModuleAdd: (courseId: string) => void
  onModuleEdit: (module: Module) => void
  onModuleDelete: (module: Module) => void
  onLessonAdd: (moduleId: string) => void
  onLessonEdit: (lesson: Lesson) => void
  onLessonDelete: (lesson: Lesson) => void
  onMoveModule: (moduleId: string, direction: 'up' | 'down') => void
  onMoveLesson: (lessonId: string, direction: 'up' | 'down') => void
  onRefresh: () => void
}

export function CourseHierarchyView({
  courses,
  modules,
  lessons,
  selectedCourse,
  selectedModule,
  currentView,
  expandedModules,
  onCourseSelect,
  onModuleSelect,
  onViewChange,
  onToggleModule,
  onCourseEdit,
  onCourseDelete,
  onModuleAdd,
  onModuleEdit,
  onModuleDelete,
  onLessonAdd,
  onLessonEdit,
  onLessonDelete,
  onMoveModule,
  onMoveLesson,
  onRefresh,
}: CourseHierarchyViewProps) {
  const router = useRouter()

  const getModuleLessons = (moduleId: string) => {
    return lessons
      .filter(lesson => lesson.module_id === moduleId)
      .sort((a, b) => a.order_index - b.order_index)
  }

  const handleLessonClick = (moduleId: string, lesson?: Lesson) => {
    if (lesson) {
      router.push(`/dashboard/gurukul/courses/lessons/${lesson.id}`)
    } else {
      router.push(`/dashboard/gurukul/courses/lessons/new?moduleId=${moduleId}`)
    }
  }

  // Courses View
  if (currentView === 'courses') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="transition-all border border-slate-200 overflow-hidden">
            <div className="aspect-video relative bg-slate-100">
              {course.cover_image_url ? (
                <img
                  src={course.cover_image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-slate-400" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={course.is_published ? "default" : "secondary"} className="text-xs">
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-base text-slate-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                  {course.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCourseSelect(course)}
                  className="flex-1 text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Manage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCourseEdit(course)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCourseDelete(course)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No courses yet</h3>
            <p className="text-slate-500">Create your first course to get started</p>
          </div>
        )}
      </div>
    )
  }

  // Modules View
  if (currentView === 'modules' && selectedCourse) {
    const sortedModules = [...modules].sort((a, b) => a.order_index - b.order_index)

    return (
      <div className="space-y-4">
        {/* Always show Add Module button at the top when viewing modules */}
        <div className="mb-4">
          <Button
            onClick={() => onModuleAdd(selectedCourse.id)}
            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>

        {sortedModules.map((module, index) => {
          const moduleLessons = getModuleLessons(module.id)
          const isExpanded = expandedModules.has(module.id)

          return (
            <Card key={module.id} className="border border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Order Controls - Left Side */}
                  <div className="flex flex-col items-center gap-1 p-4 border-r border-slate-200 bg-slate-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveModule(module.id, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <div 
                      className="rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold"
                      style={{ 
                        backgroundColor: "#3c0212", 
                        color: "#fef9fb"
                      }}
                    >
                      {index + 1}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMoveModule(module.id, 'down')}
                      disabled={index === sortedModules.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Module Content - Right Side */}
                  <div className="flex-1 p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-slate-600">{module.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onModuleEdit(module)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onModuleDelete(module)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

<div className="flex items-center justify-between">

                    {/* Info Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant={module.is_active !== false ? "default" : "secondary"} className="text-xs">
                        {module.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {moduleLessons.length} lesson{moduleLessons.length !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-slate-500">
                        Created {new Date(module.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleModule(module.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Lessons
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Lessons ({moduleLessons.length})
                          </>
                        )}
                      </Button>
                      {!isExpanded && moduleLessons.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleLessonClick(module.id)}
                          style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Lesson
                        </Button>
                      )}
                    </div>
     
                   </div>  </div>
                </div>

                {/* Expandable Lessons Section */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Lessons in this module ({moduleLessons.length})
                      </h4>
                      <Button
                        size="sm"
                        onClick={() => handleLessonClick(module.id)}
                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Lesson
                      </Button>
                    </div>

                    {moduleLessons.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg">
                        <Video className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm mb-3">No lessons in this module yet</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLessonClick(module.id)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {moduleLessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div 
                                className="rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold border-2 flex-shrink-0"
                                style={{ 
                                  backgroundColor: "#fef9fb", 
                                  color: "#3c0212",
                                  borderColor: "#3c0212"
                                }}
                              >
                                {lessonIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-slate-900 text-sm mb-1">{lesson.title}</h5>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.video_type || 'custom'}
                                  </Badge>
                                  {lesson.video_duration_seconds && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(lesson.video_duration_seconds)}
                                    </div>
                                  )}
                                  <Badge variant={lesson.is_active ? "default" : "secondary"} className="text-xs">
                                    {lesson.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveLesson(lesson.id, 'up')}
                                disabled={lessonIndex === 0}
                                className="h-7 w-7 p-0"
                              >
                                <ChevronUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onMoveLesson(lesson.id, 'down')}
                                disabled={lessonIndex === moduleLessons.length - 1}
                                className="h-7 w-7 p-0"
                              >
                                <ChevronDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLessonClick(module.id, lesson)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onLessonDelete(lesson)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {sortedModules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No modules yet</h3>
            <p className="text-slate-500 mb-4">Add the first module to {selectedCourse.title}</p>
          </div>
        )}

      </div>
    )
  }

  return null
}

