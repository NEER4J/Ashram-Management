"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType =
    | "active" | "inactive" | "expired"
    | "pending" | "completed" | "failed" | "refunded" | "cancelled" | "confirmed"
    | "planned" | "in_progress"
    | "default"

interface StatusBadgeProps {
    status: string
    className?: string
}

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    active: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    completed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    confirmed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    paid: { variant: "default", className: "bg-green-600 hover:bg-green-700" },

    inactive: { variant: "secondary", className: "text-slate-500" },
    expired: { variant: "destructive", className: "bg-slate-500" },

    pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
    planned: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
    in_progress: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },

    failed: { variant: "destructive" },
    cancelled: { variant: "destructive" },
    refunded: { variant: "outline", className: "border-red-200 text-red-700" },

    default: { variant: "secondary" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status?.toLowerCase().replace(" ", "_") || "default"
    const config = statusMap[normalizedStatus] || statusMap.default

    return (
        <Badge
            variant={config.variant}
            className={cn("capitalize", config.className, className)}
        >
            {status?.replace(/_/g, " ")}
        </Badge>
    )
}
