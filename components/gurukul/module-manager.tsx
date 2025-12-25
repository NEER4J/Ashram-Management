"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical, Save } from "lucide-react"
import { toast } from "sonner"

export type CourseModule = {
    id?: string
    course_id: string
    title: string
    description: string | null
    order_index: number
    is_active?: boolean
}

interface ModuleManagerProps {
    courseId: string
    modules: CourseModule[]
    onModulesChange: (modules: CourseModule[]) => void
}

export function ModuleManager({ courseId, modules, onModulesChange }: ModuleManagerProps) {
    const [localModules, setLocalModules] = useState<CourseModule[]>(modules)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setLocalModules(modules)
    }, [modules])

    const addModule = () => {
        const newModule: CourseModule = {
            course_id: courseId,
            title: "",
            description: null,
            order_index: localModules.length,
            is_active: true,
        }
        setLocalModules([...localModules, newModule])
    }

    const removeModule = (index: number) => {
        const updated = localModules.filter((_, i) => i !== index)
        // Reorder indices
        updated.forEach((m, i) => {
            m.order_index = i
        })
        setLocalModules(updated)
        onModulesChange(updated)
    }

    const updateModule = (index: number, field: keyof CourseModule, value: any) => {
        const updated = [...localModules]
        updated[index] = { ...updated[index], [field]: value }
        setLocalModules(updated)
    }

    const moveModule = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === localModules.length - 1)
        ) {
            return
        }

        const updated = [...localModules]
        const newIndex = direction === "up" ? index - 1 : index + 1
        ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
        // Update order indices
        updated.forEach((m, i) => {
            m.order_index = i
        })
        setLocalModules(updated)
    }

    const saveModules = async () => {
        setSaving(true)
        try {
            // Delete removed modules
            const existingIds = localModules.filter(m => m.id).map(m => m.id!)
            const { data: allModules } = await supabase
                .from("course_modules")
                .select("id")
                .eq("course_id", courseId)

            if (allModules) {
                const toDelete = allModules
                    .filter(m => !existingIds.includes(m.id))
                    .map(m => m.id)

                if (toDelete.length > 0) {
                    await supabase
                        .from("course_modules")
                        .delete()
                        .in("id", toDelete)
                }
            }

            // Upsert modules
            for (const module of localModules) {
                const moduleData = {
                    course_id: courseId,
                    title: module.title,
                    description: module.description || null,
                    order_index: module.order_index,
                    is_active: module.is_active !== false,
                }

                if (module.id) {
                    await supabase
                        .from("course_modules")
                        .update(moduleData)
                        .eq("id", module.id)
                } else {
                    const { data, error } = await supabase
                        .from("course_modules")
                        .insert(moduleData)
                        .select()
                        .single()

                    if (data) {
                        const index = localModules.indexOf(module)
                        localModules[index] = { ...module, id: data.id }
                    }
                }
            }

            toast.success("Modules saved successfully")
            onModulesChange(localModules)
        } catch (error) {
            console.error("Error saving modules:", error)
            toast.error("Failed to save modules")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Course Modules</h3>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addModule}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Module
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={saveModules}
                        disabled={saving}
                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Modules
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {localModules.map((module, index) => (
                    <div
                        key={module.id || index}
                        className="border rounded-lg p-4 space-y-4 bg-slate-50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">
                                    Module {index + 1}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {index > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveModule(index, "up")}
                                    >
                                        ↑
                                    </Button>
                                )}
                                {index < localModules.length - 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveModule(index, "down")}
                                    >
                                        ↓
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeModule(index)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Input
                            placeholder="Module Title"
                            value={module.title}
                            onChange={(e) => updateModule(index, "title", e.target.value)}
                            className="mb-2"
                        />

                        <Textarea
                            placeholder="Module Description"
                            value={module.description || ""}
                            onChange={(e) => updateModule(index, "description", e.target.value)}
                            rows={2}
                        />

                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={module.is_active !== false}
                                onCheckedChange={(checked) => updateModule(index, "is_active", checked)}
                            />
                            <label className="text-sm">Active</label>
                        </div>
                        
                        <p className="text-xs text-slate-500 mt-2">
                            Note: Add lessons to this module after saving. Lessons contain the actual video content.
                        </p>
                    </div>
                ))}

                {localModules.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        No modules added yet. Click "Add Module" to get started.
                    </div>
                )}
            </div>
        </div>
    )
}

