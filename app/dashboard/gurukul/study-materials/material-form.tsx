"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { StudyMaterialFormValues, studyMaterialSchema } from "./schema"
import { FormWrapper } from "@/components/form-wrapper"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/gurukul/file-upload"
import { Upload, X } from "lucide-react"

interface MaterialFormProps {
    initialData?: Partial<StudyMaterialFormValues> & { id?: string }
    onSuccess?: () => void
}

export function MaterialForm({ initialData, onSuccess }: MaterialFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<StudyMaterialFormValues>({
        resolver: zodResolver(studyMaterialSchema) as any,
        defaultValues: {
            title: initialData?.title ?? "",
            description: initialData?.description ?? "",
            type: initialData?.type ?? "Book",
            price: initialData?.price ?? 0,
            is_free: initialData?.is_free ?? false,
            is_published: initialData?.is_published ?? false,
            cover_image_url: initialData?.cover_image_url ?? "",
            author: initialData?.author ?? "",
            language: initialData?.language ?? "English",
            stock_quantity: initialData?.stock_quantity ?? 0,
            is_digital: initialData?.is_digital ?? true,
            file_urls: initialData?.file_urls ?? [],
            metadata: initialData?.metadata ?? {},
        }
    })

    const watchType = form.watch("type")
    const watchIsDigital = form.watch("is_digital")
    const watchIsFree = form.watch("is_free")

    // Auto-set is_digital based on type
    useEffect(() => {
        if (watchType === "Book") {
            form.setValue("is_digital", false)
        } else {
            form.setValue("is_digital", true)
        }
    }, [watchType, form])

    // Auto-set price to 0 if free
    useEffect(() => {
        if (watchIsFree) {
            form.setValue("price", 0)
        }
    }, [watchIsFree, form])

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
                if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
                    throw new Error('Storage bucket "gurukul-files" not found. Please create it in Supabase Storage settings.')
                }
                throw uploadError
            }

            const { data } = supabase.storage
                .from('gurukul-files')
                .getPublicUrl(filePath)

            form.setValue("cover_image_url", data.publicUrl)
            toast.success("Cover image uploaded")
        } catch (error: any) {
            console.error("Error uploading image:", error)
            const errorMessage = error?.message || "Failed to upload image"
            toast.error(errorMessage)
        } finally {
            setUploadingImage(false)
            event.target.value = ""
        }
    }

    async function onSubmit(data: StudyMaterialFormValues) {
        setLoading(true)
        try {
            const submitData: any = {
                ...data,
                metadata: data.metadata || {},
            }

            const { error } = initialData?.id
                ? await supabase.from("study_materials").update(submitData).eq("id", initialData.id)
                : await supabase.from("study_materials").insert(submitData)

            if (error) throw error

            toast.success(initialData ? "Material updated" : "Material created")
            router.refresh()
            onSuccess?.()
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FormWrapper<StudyMaterialFormValues>
            form={form}
            onSubmit={onSubmit}
            loading={loading}
            submitLabel={initialData ? "Update Material" : "Create Material"}
        >
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl><Input {...field} placeholder="Enter material title" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} placeholder="Enter description" rows={4} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Book">Book</SelectItem>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="Video">Video</SelectItem>
                                <SelectItem value="Audio">Audio</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Author</FormLabel>
                            <FormControl><Input {...field} placeholder="Author name" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Language</FormLabel>
                            <FormControl><Input {...field} placeholder="Language" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="flex items-center gap-6">
                <FormField
                    control={form.control}
                    name="is_free"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Free Material</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>Published</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                {watchType === "Book" && (
                    <FormField
                        control={form.control}
                        name="is_digital"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Digital</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                )}
            </div>

            {!watchIsFree && (
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price (₹)</FormLabel>
                            <FormControl>
                                <Input 
                                    {...field} 
                                    type="number" 
                                    min="0" 
                                    step="0.01"
                                    disabled={watchIsFree}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            {watchType === "Book" && !watchIsDigital && (
                <FormField
                    control={form.control}
                    name="stock_quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" min="0" step="1" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}

            <FormField
                control={form.control}
                name="cover_image_url"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <div className="space-y-4">
                            {field.value && (
                                <div className="relative w-32 h-48 border rounded-lg overflow-hidden">
                                    <img
                                        src={field.value}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2 h-6 w-6 p-0"
                                        onClick={() => field.onChange("")}
                                    >
                                        <X className="h-3 w-3" />
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
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {field.value ? "Change Image" : "Upload Cover Image"}
                                </Button>
                            </div>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {(watchIsDigital || watchType !== "Book") && (
                <FormField
                    control={form.control}
                    name="file_urls"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Files</FormLabel>
                            <FormControl>
                                <FileUpload
                                    files={field.value || []}
                                    onFilesChange={field.onChange}
                                    accept={watchType === "Video" ? "video/*" : watchType === "Audio" ? "audio/*" : watchType === "PDF" ? "application/pdf" : "*/*"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </FormWrapper>
    )
}

