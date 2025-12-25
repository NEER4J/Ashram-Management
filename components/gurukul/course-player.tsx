"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, CheckCircle, Lock, Download } from "lucide-react"
import { toast } from "sonner"

interface CoursePlayerProps {
    courseId: string
    enrollmentId: string
    modules: any[]
}

export function CoursePlayer({ courseId, enrollmentId, modules }: CoursePlayerProps) {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
    const [moduleProgress, setModuleProgress] = useState<Record<string, boolean>>({})
    const [overallProgress, setOverallProgress] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const fetchProgress = async () => {
            const { data } = await supabase
                .from("module_progress")
                .select("module_id, completed_at")
                .eq("enrollment_id", enrollmentId)

            if (data) {
                const progressMap: Record<string, boolean> = {}
                data.forEach(p => {
                    if (p.completed_at) {
                        progressMap[p.module_id] = true
                    }
                })
                setModuleProgress(progressMap)

                // Calculate overall progress
                const completedCount = Object.values(progressMap).filter(Boolean).length
                const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0
                setOverallProgress(progress)

                // Update enrollment progress
                await supabase
                    .from("course_enrollments")
                    .update({
                        progress_percentage: progress,
                        last_accessed_at: new Date().toISOString(),
                    })
                    .eq("id", enrollmentId)
            }
        }

        if (enrollmentId && modules.length > 0) {
            fetchProgress()
        }
    }, [enrollmentId, modules, supabase])

    const markModuleComplete = async (moduleId: string) => {
        try {
            const { error } = await supabase
                .from("module_progress")
                .upsert({
                    enrollment_id: enrollmentId,
                    module_id: moduleId,
                    completed_at: new Date().toISOString(),
                    last_accessed_at: new Date().toISOString(),
                })

            if (error) throw error

            setModuleProgress(prev => ({ ...prev, [moduleId]: true }))
            
            // Recalculate progress
            const completedCount = Object.values({ ...moduleProgress, [moduleId]: true }).filter(Boolean).length
            const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0
            setOverallProgress(progress)

            await supabase
                .from("course_enrollments")
                .update({
                    progress_percentage: progress,
                })
                .eq("id", enrollmentId)

            toast.success("Module marked as complete!")
        } catch (error) {
            console.error("Error marking module complete:", error)
            toast.error("Failed to update progress")
        }
    }

    const currentModule = modules[currentModuleIndex]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Player */}
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardContent className="p-6">
                        {currentModule ? (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                                        {currentModule.title}
                                    </h2>
                                    {currentModule.description && (
                                        <p className="text-slate-600">{currentModule.description}</p>
                                    )}
                                </div>

                                <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                                    {currentModule.content_url ? (
                                        currentModule.content_type === "Video" ? (
                                            <video
                                                src={currentModule.content_url}
                                                controls
                                                className="w-full h-full"
                                            />
                                        ) : currentModule.content_type === "PDF" ? (
                                            <iframe
                                                src={currentModule.content_url}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <div className="text-center text-white p-8">
                                                <p className="mb-4">Content Type: {currentModule.content_type}</p>
                                                <a
                                                    href={currentModule.content_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded hover:bg-slate-100"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download Content
                                                </a>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center text-white">
                                            <p>No content available for this module</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {currentModuleIndex > 0 && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentModuleIndex(currentModuleIndex - 1)}
                                            >
                                                Previous
                                            </Button>
                                        )}
                                        {currentModuleIndex < modules.length - 1 && (
                                            <Button
                                                onClick={() => setCurrentModuleIndex(currentModuleIndex + 1)}
                                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                                            >
                                                Next
                                            </Button>
                                        )}
                                    </div>
                                    <Button
                                        variant={moduleProgress[currentModule.id] ? "outline" : "default"}
                                        onClick={() => markModuleComplete(currentModule.id)}
                                        disabled={moduleProgress[currentModule.id]}
                                    >
                                        {moduleProgress[currentModule.id] ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Completed
                                            </>
                                        ) : (
                                            "Mark as Complete"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No modules available</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar - Module List */}
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-4">Course Progress</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Overall Progress</span>
                                <span className="font-medium">{overallProgress.toFixed(0)}%</span>
                            </div>
                            <Progress value={overallProgress} className="h-2" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-4">Modules</h3>
                        <div className="space-y-2">
                            {modules.map((module, index) => (
                                <button
                                    key={module.id}
                                    onClick={() => setCurrentModuleIndex(index)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                        index === currentModuleIndex
                                            ? "border-[#3c0212] bg-[#fef9fb]"
                                            : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {moduleProgress[module.id] ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Lock className="h-4 w-4 text-slate-400" />
                                        )}
                                        <span className="text-sm font-medium text-slate-900">
                                            {index + 1}. {module.title}
                                        </span>
                                    </div>
                                    {module.duration_minutes && (
                                        <p className="text-xs text-slate-500 ml-6">
                                            {module.duration_minutes} min
                                        </p>
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

