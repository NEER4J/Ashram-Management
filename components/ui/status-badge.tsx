"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: string
    className?: string
}

const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
    // Green — success / done
    active: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    completed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    confirmed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    paid: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    redeemed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    distributed: { variant: "default", className: "bg-green-600 hover:bg-green-700" },
    received: { variant: "default", className: "bg-green-600 hover:bg-green-700" },

    // Blue — in progress / approved
    in_progress: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },
    planned: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },
    submitted: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },
    approved: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },
    prepared: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },
    assigned: { variant: "secondary", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-300" },

    // Amber — waiting / pending
    pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300" },
    issued: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300" },
    scheduled: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300" },

    // Gray — draft / inactive
    draft: { variant: "secondary" },
    inactive: { variant: "secondary" },
    expired: { variant: "secondary", className: "text-slate-500" },

    // Red — failure / cancellation
    failed: { variant: "destructive" },
    cancelled: { variant: "destructive" },
    no_show: { variant: "destructive" },
    refunded: { variant: "outline", className: "border-red-200 text-red-700" },

    default: { variant: "secondary" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, "_") || "default"
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
