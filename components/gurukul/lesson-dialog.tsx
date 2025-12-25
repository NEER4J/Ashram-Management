"use client"

import { useState, useEffect } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VideoPreview } from "./video-preview"
import { detectVideoType, VideoType, formatDuration } from "@/lib/utils/video-embed"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface LessonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  moduleId: string
  lesson?: {
    id: string
    title: string
    description: string | null
    video_url: string | null
    video_type: VideoType | null
    video_duration_seconds: number | null
    order_index: number
  } | null
  mode: "create" | "edit"
  onSuccess: () => void
}

export function LessonDialog({
  open,
  onOpenChange,
  moduleId,
  lesson,
  mode,
  onSuccess,
}: LessonDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [videoType, setVideoType] = useState<VideoType>("custom")
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      if (lesson) {
        setTitle(lesson.title || "")
        setDescription(lesson.description || "")
        setVideoUrl(lesson.video_url || "")
        setVideoType(lesson.video_type || "custom")
        setDurationSeconds(lesson.video_duration_seconds || 0)
      } else {
        setTitle("")
        setDescription("")
        setVideoUrl("")
        setVideoType("custom")
        setDurationSeconds(0)
      }
    }
  }, [open, lesson])

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
        module_id: moduleId,
        title: title.trim(),
        description: description.trim() || null,
        video_url: videoUrl.trim(),
        video_type: videoType,
        video_duration_seconds: durationSeconds,
        order_index: lesson?.order_index || 0,
        is_active: true,
      }

      if (mode === "create") {
        // Get max order_index for this module
        const { data: existingLessons } = await supabase
          .from("course_lessons")
          .select("order_index")
          .eq("module_id", moduleId)
          .order("order_index", { ascending: false })
          .limit(1)

        const maxOrder = existingLessons?.[0]?.order_index ?? -1
        lessonData.order_index = maxOrder + 1

        const { error } = await supabase
          .from("course_lessons")
          .insert([lessonData])

        if (error) throw error
        toast.success("Lesson created successfully")
      } else {
        if (!lesson?.id) return

        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", lesson.id)

        if (error) throw error
        toast.success("Lesson updated successfully")
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving lesson:", error)
      toast.error(error?.message || "Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Lesson" : "Edit Lesson"}
          </DialogTitle>
          <DialogDescription>
            Add a lesson to this module. Lessons contain the actual video content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Left Column - Form */}
          <div className="space-y-4">
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
                rows={4}
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
          </div>

          {/* Right Column - Preview */}
          <div>
            <Label>Video Preview</Label>
            <div className="mt-1">
              <VideoPreview videoUrl={videoUrl} videoType={videoType} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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
              mode === "create" ? "Create Lesson" : "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

