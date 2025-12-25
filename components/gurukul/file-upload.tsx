"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Upload, X, File, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FileUploadProps {
    files: string[]
    onFilesChange: (files: string[]) => void
    accept?: string
    multiple?: boolean
    folder?: string
}

export function FileUpload({ 
    files, 
    onFilesChange, 
    accept = "*/*",
    multiple = true,
    folder = "gurukul"
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (!selectedFiles || selectedFiles.length === 0) return

        setUploading(true)
        const uploadedUrls: string[] = []

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i]
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `${folder}/${fileName}`

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

                uploadedUrls.push(data.publicUrl)
            }

            onFilesChange([...files, ...uploadedUrls])
            toast.success(`${uploadedUrls.length} file(s) uploaded successfully`)
        } catch (error: any) {
            console.error("Error uploading file:", error)
            const errorMessage = error?.message || "Failed to upload file(s)"
            toast.error(errorMessage)
        } finally {
            setUploading(false)
            // Reset input
            event.target.value = ""
        }
    }

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        onFilesChange(newFiles)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={uploading}
                    className="w-full"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Files
                        </>
                    )}
                </Button>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Uploaded Files:</p>
                    <div className="space-y-2">
                        {files.map((url, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 border rounded-lg bg-slate-50"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <File className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-700 hover:underline truncate"
                                    >
                                        {url.split('/').pop()}
                                    </a>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

