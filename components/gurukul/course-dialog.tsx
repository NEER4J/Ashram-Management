"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface CourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course?: {
    id: string
    title: string
    description: string | null
    price?: number
    is_free?: boolean
    is_published: boolean
    cover_image_url: string | null
    author?: string | null
    language?: string
  } | null
  mode: "create" | "edit"
  onSuccess: (courseId: string) => void
}

export function CourseDialog({
  open,
  onOpenChange,
  course,
  mode,
  onSuccess,
}: CourseDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [isFree, setIsFree] = useState(false)
  const [isPublished, setIsPublished] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [author, setAuthor] = useState("")
  const [language, setLanguage] = useState("English")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      if (course) {
        setTitle(course.title || "")
        setDescription(course.description || "")
        setPrice(course.price ?? 0)
        setIsFree(course.is_free ?? false)
        setIsPublished(course.is_published || false)
        setCoverImageUrl(course.cover_image_url || "")
        setAuthor(course.author || "")
        setLanguage(course.language || "English")
      } else {
        setTitle("")
        setDescription("")
        setPrice(0)
        setIsFree(false)
        setIsPublished(false)
        setCoverImageUrl("")
        setAuthor("")
        setLanguage("English")
      }
    }
  }, [open, course])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `gurukul/covers/${fileName}`

      console.log("Uploading image to:", filePath)

      // Delete old image if editing
      if (coverImageUrl && course && mode === "edit") {
        try {
          // Extract the path from the full URL
          const urlParts = coverImageUrl.split('/')
          const bucketIndex = urlParts.findIndex(part => part === 'gurukul-files')
          if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
            const oldPath = urlParts.slice(bucketIndex + 1).join('/')
            console.log("Deleting old image:", oldPath)
            await supabase.storage
              .from('gurukul-files')
              .remove([oldPath])
          }
        } catch (error) {
          // Ignore errors when deleting old image
          console.log("Could not delete old image:", error)
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('gurukul-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error('Storage bucket "gurukul-files" not found. Please create it in Supabase Storage settings.')
        }
        if (uploadError.message?.includes('already exists') || uploadError.message?.includes('duplicate')) {
          // Try with a different filename
          const newFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const newFilePath = `gurukul/covers/${newFileName}`
          console.log("Retrying with new filename:", newFilePath)
          const { error: retryError } = await supabase.storage
            .from('gurukul-files')
            .upload(newFilePath, file)
          if (retryError) {
            console.error("Retry upload error:", retryError)
            throw retryError
          }
          const { data } = supabase.storage
            .from('gurukul-files')
            .getPublicUrl(newFilePath)
          setCoverImageUrl(data.publicUrl)
          toast.success("Cover image uploaded successfully")
        } else {
          throw uploadError
        }
      } else {
        const { data } = supabase.storage
          .from('gurukul-files')
          .getPublicUrl(filePath)

        console.log("Image uploaded successfully, URL:", data.publicUrl)
        setCoverImageUrl(data.publicUrl)
        toast.success("Cover image uploaded successfully")
      }
    } catch (error: any) {
      console.error("Error uploading image:", error)
      const errorMessage = error?.message || error?.toString() || "Failed to upload image"
      toast.error(errorMessage)
    } finally {
      setUploadingImage(false)
      // Reset input to allow selecting the same file again
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Course title is required")
      return
    }

    setSaving(true)
    try {
      const courseData = {
        title: title.trim(),
        description: description.trim() || null,
        price: isFree ? 0 : price,
        is_free: isFree,
        is_published: isPublished,
        cover_image_url: coverImageUrl || null,
        author: author.trim() || null,
        language: language || "English",
        type: "Course" as const,
        is_digital: true,
        file_urls: [],
      }

      if (mode === "create") {
        const { data, error } = await supabase
          .from("study_materials")
          .insert([courseData])
          .select()
          .single()

        if (error) throw error
        toast.success("Course created successfully")
        onSuccess(data.id)
      } else {
        if (!course?.id) return

        const { error } = await supabase
          .from("study_materials")
          .update(courseData)
          .eq("id", course.id)

        if (error) throw error
        toast.success("Course updated successfully")
        onSuccess(course.id)
      }

      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving course:", error)
      toast.error(error?.message || "Failed to save course")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Course" : "Edit Course"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new course. You can add modules and lessons after creating the course."
              : "Update course information."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your course..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="author">Author/Instructor</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="Language"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Cover Image</Label>
            <div className="mt-2 space-y-2">
              {coverImageUrl && (
                <div className="relative inline-block">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-32 w-auto rounded-lg border border-slate-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => setCoverImageUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log("File input changed", e.target.files)
                    handleImageUpload(e)
                  }}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    console.log("Upload button clicked")
                    const input = document.getElementById("cover-upload") as HTMLInputElement
                    console.log("Input element:", input)
                    if (input) {
                      input.click()
                    } else {
                      console.error("Could not find cover-upload input element")
                    }
                  }}
                  disabled={uploadingImage}
                  className="w-full sm:w-auto"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {coverImageUrl ? "Change Image" : "Upload Cover Image"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={isFree}
                onCheckedChange={(checked) => {
                  setIsFree(checked as boolean)
                  if (checked) setPrice(0)
                }}
              />
              <Label htmlFor="isFree">Free Course</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={isPublished}
                onCheckedChange={(checked) => setIsPublished(checked as boolean)}
              />
              <Label htmlFor="isPublished">Publish Course</Label>
            </div>
          </div>

          {!isFree && (
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              mode === "create" ? "Create Course" : "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

