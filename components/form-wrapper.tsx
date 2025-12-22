"use client"

import { ReactNode } from "react"
import { UseFormReturn } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface FormWrapperProps<T extends import("react-hook-form").FieldValues> {
    form: UseFormReturn<T>
    onSubmit: (data: T) => void
    children: ReactNode
    title?: string
    description?: string
    submitLabel?: string
    loading?: boolean
    className?: string
}

export function FormWrapper<T extends import("react-hook-form").FieldValues>({
    form,
    onSubmit,
    children,
    title,
    description,
    submitLabel = "Save Changes",
    loading = false,
    className,
}: FormWrapperProps<T>) {
    return (
        <div className={className}>
            {(title || description) && (
                <div className="mb-6 space-y-1">
                    {title && <h3 className="text-lg font-medium">{title}</h3>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        {children}
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
