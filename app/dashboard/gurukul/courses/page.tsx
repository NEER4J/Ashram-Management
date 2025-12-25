"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CourseHierarchyView } from "@/components/gurukul/course-hierarchy-view"
import { CourseDialog } from "@/components/gurukul/course-dialog"
import { Plus, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Course = {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  is_published: boolean
  price?: number
  is_free?: boolean
  author?: string | null
  language?: string
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

type ViewState = 'courses' | 'modules' | 'lessons'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [currentView, setCurrentView] = useState<ViewState>('courses')
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [dialogData, setDialogData] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchCourses()
  }, [supabase])

  useEffect(() => {
    if (selectedCourse && currentView === 'modules') {
      fetchModules(selectedCourse.id)
    }
  }, [selectedCourse, currentView, supabase])

  useEffect(() => {
    if (selectedModule && currentView === 'lessons') {
      fetchLessons(selectedModule.id)
    }
  }, [selectedModule, currentView, supabase])

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('id, title, description, cover_image_url, is_published, price, is_free, author, language, created_at')
        .eq('type', 'Course')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses((data || []) as Course[])
    } catch (error: any) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async (courseId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index')

      if (error) throw error
      setModules(data || [])

      // Also fetch all lessons for these modules
      if (data && data.length > 0) {
        const moduleIds = data.map(m => m.id)
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('course_lessons')
          .select('*')
          .in('module_id', moduleIds)
          .order('order_index')

        if (lessonsError) throw lessonsError
        setLessons(lessonsData || [])
      } else {
        setLessons([])
      }
    } catch (error: any) {
      console.error('Error fetching modules:', error)
      toast.error('Failed to fetch modules')
    }
  }

  const fetchLessons = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index')

      if (error) throw error
      setLessons(data || [])
    } catch (error: any) {
      console.error('Error fetching lessons:', error)
      toast.error('Failed to fetch lessons')
    }
  }

  const handleModuleSave = async () => {
    // Validation
    if (!formData.title || !formData.title.trim()) {
      toast.error("Module title is required")
      return
    }

    if (!selectedCourse?.id) {
      toast.error("Please select a course first")
      return
    }

    setSaving(true)
    try {
      const moduleData: any = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        course_id: selectedCourse.id,
        content_type: 'Video', // Required by current schema - will be nullable after migration
        is_active: formData.is_active !== false,
      }

      if (dialogMode === 'create') {
        // Get max order_index for this course
        const { data: existingModules } = await supabase
          .from('course_modules')
          .select('order_index')
          .eq('course_id', selectedCourse.id)
          .order('order_index', { ascending: false })
          .limit(1)

        const maxOrder = existingModules?.[0]?.order_index ?? -1
        moduleData.order_index = maxOrder + 1

        const { data, error } = await supabase
          .from('course_modules')
          .insert([moduleData])
          .select()
          .single()

        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message || 'Failed to create module')
        }
        toast.success('Module created successfully')
      } else {
        if (!dialogData?.id) {
          toast.error("Module ID is missing")
          return
        }

        // Keep existing order_index when editing
        moduleData.order_index = formData.order_index ?? dialogData.order_index

        const { error } = await supabase
          .from('course_modules')
          .update(moduleData)
          .eq('id', dialogData.id)

        if (error) {
          console.error('Supabase error:', error)
          throw new Error(error.message || 'Failed to update module')
        }
        toast.success('Module updated successfully')
      }
      
      if (selectedCourse) {
        await fetchModules(selectedCourse.id)
      }
      setModuleDialogOpen(false)
      setFormData({})
      setDialogData(null)
    } catch (error: any) {
      console.error('Error saving module:', error)
      const errorMessage = error?.message || error?.toString() || 'Failed to save module'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (type: 'course' | 'module' | 'lesson', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      let table = ''
      switch (type) {
        case 'course':
          table = 'study_materials'
          break
        case 'module':
          table = 'course_modules'
          break
        case 'lesson':
          table = 'course_lessons'
          break
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)

      if (type === 'course') {
        fetchCourses()
        setSelectedCourse(null)
        setCurrentView('courses')
      } else if (type === 'module' && selectedCourse) {
        fetchModules(selectedCourse.id)
      } else if (type === 'lesson' && selectedModule) {
        fetchLessons(selectedModule.id)
      }
    } catch (error: any) {
      console.error('Error deleting:', error)
      toast.error('Failed to delete')
    }
  }

  const moveItem = async (type: 'module' | 'lesson', id: string, direction: 'up' | 'down') => {
    try {
      let items: any[] = []
      let table = ''

      if (type === 'module') {
        items = modules
        table = 'course_modules'
      } else if (type === 'lesson') {
        items = lessons
        table = 'course_lessons'
      }

      const currentIndex = items.findIndex(item => item.id === id)
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (targetIndex < 0 || targetIndex >= items.length) return

      const updates = [
        { id: items[currentIndex].id, order_index: targetIndex },
        { id: items[targetIndex].id, order_index: currentIndex }
      ]

      for (const update of updates) {
        const { error } = await supabase
          .from(table)
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) throw error
      }

      if (type === 'module' && selectedCourse) {
        fetchModules(selectedCourse.id)
      } else if (type === 'lesson' && selectedModule) {
        fetchLessons(selectedModule.id)
      }
    } catch (error: any) {
      console.error('Error reordering:', error)
      toast.error('Failed to reorder')
    }
  }

  const openCourseDialog = (mode: 'create' | 'edit', course?: Course) => {
    setEditingCourse(course || null)
    setCourseDialogOpen(true)
  }

  const openModuleDialog = (mode: 'create' | 'edit', module?: Module) => {
    if (mode === 'create' && !selectedCourse?.id) {
      toast.error("Please select a course first")
      return
    }
    setDialogMode(mode)
    setDialogData(module || null)
    setFormData(module ? { ...module } : { title: '', description: '', is_active: true })
    setModuleDialogOpen(true)
  }

  const handleCourseSuccess = async (courseId: string) => {
    await fetchCourses()
    // Navigate to modules view for the new course
    const newCourse = courses.find(c => c.id === courseId)
    if (newCourse) {
      setSelectedCourse(newCourse)
      setCurrentView('modules')
    } else {
      // If course not found in list yet, fetch it
      const { data } = await supabase
        .from('study_materials')
        .select('*')
        .eq('id', courseId)
        .eq('type', 'Course')
        .single()
      if (data) {
        setSelectedCourse(data as Course)
        setCurrentView('modules')
      }
    }
  }

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const getBreadcrumb = () => {
    if (currentView === 'courses') return 'All Courses'
    if (currentView === 'modules') return `${selectedCourse?.title} / Modules`
    if (currentView === 'lessons') return `${selectedCourse?.title} / ${selectedModule?.title} / Lessons`
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {currentView !== 'courses' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (currentView === 'lessons') {
                    setCurrentView('modules')
                    setSelectedModule(null)
                  } else if (currentView === 'modules') {
                    setCurrentView('courses')
                    setSelectedCourse(null)
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <h2 className="text-3xl font-medium tracking-tight text-slate-900">
              Course Management
            </h2>
          </div>
          <p className="text-slate-600">
            {getBreadcrumb()}
          </p>
        </div>
        {currentView === 'courses' && (
          <Button
            onClick={() => openCourseDialog('create')}
            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        )}
      </div>

      <CourseHierarchyView
        courses={courses}
        modules={modules}
        lessons={lessons}
        selectedCourse={selectedCourse}
        selectedModule={selectedModule}
        currentView={currentView}
        expandedModules={expandedModules}
        onCourseSelect={(course) => {
          setSelectedCourse(course)
          setCurrentView('modules')
        }}
        onModuleSelect={(module) => {
          setSelectedModule(module)
          setCurrentView('lessons')
        }}
        onViewChange={setCurrentView}
        onToggleModule={toggleModuleExpansion}
        onCourseEdit={(course) => {
          openCourseDialog('edit', course)
        }}
        onCourseDelete={(course) => handleDelete('course', course.id)}
        onModuleAdd={(courseId) => openModuleDialog('create')}
        onModuleEdit={(module) => openModuleDialog('edit', module)}
        onModuleDelete={(module) => handleDelete('module', module.id)}
        onLessonAdd={(moduleId) => {
          // Navigate to lesson page
          router.push(`/dashboard/gurukul/courses/lessons/new?moduleId=${moduleId}`)
        }}
        onLessonEdit={(lesson) => {
          // Navigate to lesson edit page
          router.push(`/dashboard/gurukul/courses/lessons/${lesson.id}`)
        }}
        onLessonDelete={(lesson) => handleDelete('lesson', lesson.id)}
        onMoveModule={(moduleId, direction) => moveItem('module', moduleId, direction)}
        onMoveLesson={(lessonId, direction) => moveItem('lesson', lessonId, direction)}
        onRefresh={() => {
          if (selectedCourse) {
            fetchModules(selectedCourse.id)
          }
        }}
      />

      {/* Course Dialog */}
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        course={editingCourse}
        mode={editingCourse ? 'edit' : 'create'}
        onSuccess={handleCourseSuccess}
      />

      {/* Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? 'Create' : 'Edit'} Module
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'create'
                ? 'Create a new module for this course'
                : 'Update module information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={formData.title || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter module title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={formData.description || ''}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter module description"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="module-is_active"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="module-is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleModuleSave}
              disabled={saving || !formData.title}
              style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                dialogMode === 'create' ? 'Create' : 'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
