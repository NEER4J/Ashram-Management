"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VideoPreview } from "@/components/gurukul/video-preview"
import { detectVideoType, VideoType, formatDuration } from "@/lib/utils/video-embed"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function EditLessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.id as string
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoType, setVideoType] = useState<VideoType>("custom")
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchLesson = async () => {
      const { data: lessonData, error: lessonError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("id", lessonId)
        .single()

      if (lessonError || !lessonData) {
        toast.error("Lesson not found")
        router.push("/dashboard/gurukul/courses")
        return
      }

      setLesson(lessonData)
      setTitle(lessonData.title || "")
      setDescription(lessonData.description || "")
      setVideoUrl(lessonData.video_url || "")
      setVideoType((lessonData.video_type as VideoType) || "custom")
      setDurationSeconds(lessonData.video_duration_seconds || 0)

      // Fetch module info
      const { data: moduleData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("id", lessonData.module_id)
        .single()

      if (moduleData) {
        setModule(moduleData)
      }

      setLoading(false)
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId, router, supabase])

  useEffect(() => {
    // Auto-detect video type when URL changes
    if (videoUrl && !lesson) {
      const detected = detectVideoType(videoUrl)
      setVideoType(detected)
    }
  }, [videoUrl, lesson])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Lesson title is required")
      return
    }

    if (!videoUrl.trim()) {
      toast.error("Video URL is required")
      return
    }

    setSaving(true)
    try {
      const lessonData = {
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        video_type: videoType,
        video_duration_seconds: durationSeconds,
        is_active: lesson?.is_active !== false,
      }

      const { error } = await supabase
        .from("course_lessons")
        .update(lessonData)
        .eq("id", lessonId)

      if (error) throw error

      toast.success("Lesson updated successfully")
      router.push(`/dashboard/gurukul/courses`)
    } catch (error: any) {
      console.error("Error saving lesson:", error)
      toast.error(error?.message || "Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="mb-6">
        <Link href="/dashboard/gurukul/courses">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Edit Lesson</h1>
        <p className="text-slate-600 mt-1">
          {module && `Module: ${module.title}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter lesson description"
              rows={6}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Supports Vimeo, Loom, YouTube, or custom video URLs
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="videoType">Video Type</Label>
              <Select
                value={videoType}
                onValueChange={(value: VideoType) => setVideoType(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="loom">Loom</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="custom">Custom URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
              {durationSeconds > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {formatDuration(durationSeconds)}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/gurukul/courses")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title.trim() || !videoUrl.trim()}
              style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div>
          <Label>Video Preview</Label>
          <div className="mt-1">
            <VideoPreview videoUrl={videoUrl} videoType={videoType} />
          </div>
        </div>
      </div>
    </div>
  )
}

