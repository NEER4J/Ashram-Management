"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Upload, X, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { FileUpload } from "./file-upload"
import { ModuleManager, CourseModule } from "./module-manager"

interface CourseBuilderProps {
    courseId?: string
    initialData?: any
    onSave: (data: any) => Promise<void>
    mode: "create" | "edit"
}

export function CourseBuilder({ courseId, initialData, onSave, mode }: CourseBuilderProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [price, setPrice] = useState(initialData?.price || 0)
    const [isFree, setIsFree] = useState(initialData?.is_free || false)
    const [isPublished, setIsPublished] = useState(initialData?.is_published || false)
    const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "")
    const [author, setAuthor] = useState(initialData?.author || "")
    const [language, setLanguage] = useState(initialData?.language || "English")
    const [modules, setModules] = useState<CourseModule[]>([])
    const [uploadingImage, setUploadingImage] = useState(false)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (courseId && mode === "edit") {
            const fetchModules = async () => {
                const { data } = await supabase
                    .from("course_modules")
                    .select("*")
                    .eq("course_id", courseId)
                    .order("order_index", { ascending: true })

                if (data) {
                    setModules(data)
                }
            }
            fetchModules()
        }
    }, [courseId, mode, supabase])

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploadingImage(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `gurukul/covers/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('gurukul-files')
                .upload(filePath, file)

            if (uploadError) {
                if (uploadError.message?.includes('Bucket not found')) {
                    throw new Error('Storage bucket "gurukul-files" not found. Please create it in Supabase Storage settings.')
                }
                throw uploadError
            }

            const { data } = supabase.storage
                .from('gurukul-files')
                .getPublicUrl(filePath)

            setCoverImageUrl(data.publicUrl)
            toast.success("Cover image uploaded")
        } catch (error: any) {
            console.error("Error uploading image:", error)
            toast.error(error?.message || "Failed to upload image")
        } finally {
            setUploadingImage(false)
            event.target.value = ""
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
                title,
                description: description || null,
                price: isFree ? 0 : price,
                is_free: isFree,
                is_published: isPublished,
                cover_image_url: coverImageUrl || null,
                author: author || null,
                language: language || "English",
                type: "Course" as const,
                is_digital: true,
                file_urls: [],
            }

            await onSave(courseData)
        } catch (error: any) {
            console.error("Error saving course:", error)
            toast.error(error?.message || "Failed to save course")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <Label htmlFor="title" className="text-base font-semibold">Course Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter course title"
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your course..."
                            rows={6}
                            className="mt-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="author" className="text-base font-semibold">Author/Instructor</Label>
                            <Input
                                id="author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Author name"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="language" className="text-base font-semibold">Language</Label>
                            <Input
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                placeholder="Language"
                                className="mt-2"
                            />
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
                            <Label htmlFor="price" className="text-base font-semibold">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                disabled={isFree}
                                className="mt-2"
                            />
                        </div>
                    )}
                </div>

                {/* Cover Image */}
                <div>
                    <Label className="text-base font-semibold">Cover Image</Label>
                    <div className="mt-2 space-y-4">
                        {coverImageUrl && (
                            <div className="relative aspect-video rounded-lg overflow-hidden border">
                                <img
                                    src={coverImageUrl}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => setCoverImageUrl("")}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                id="cover-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById("cover-upload")?.click()}
                                disabled={uploadingImage}
                                className="w-full"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {coverImageUrl ? "Change Image" : "Upload Cover Image"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Section - Only show if editing existing course */}
            {courseId && mode === "edit" && (
                <div>
                    <ModuleManager
                        courseId={courseId}
                        modules={modules}
                        onModulesChange={(updatedModules) => {
                            setModules(updatedModules)
                        }}
                    />
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                >
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
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {mode === "create" ? "Create Course" : "Save Changes"}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

