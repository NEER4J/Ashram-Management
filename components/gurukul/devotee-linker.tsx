"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { linkUserToDevotee } from "@/lib/auth/role-check"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"

interface Devotee {
    id: string
    first_name: string
    middle_name?: string
    last_name?: string
    mobile_number: string
    email?: string
    devotee_code?: string
}

interface DevoteeLinkerProps {
    userId?: string
    onLinked?: (devotee: Devotee) => void
}

export function DevoteeLinker({ userId, onLinked }: DevoteeLinkerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [devotees, setDevotees] = useState<Devotee[]>([])
    const [loading, setLoading] = useState(false)
    const [linking, setLinking] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (searchQuery.length >= 2) {
            searchDevotees()
        } else {
            setDevotees([])
        }
    }, [searchQuery])

    const searchDevotees = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from("devotees")
                .select("id, first_name, middle_name, last_name, mobile_number, email, devotee_code")
                .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,mobile_number.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
                .limit(10)

            if (error) throw error
            setDevotees(data || [])
        } catch (error) {
            toast.error("Failed to search devotees")
            setDevotees([])
        } finally {
            setLoading(false)
        }
    }

    const handleLink = async (devotee: Devotee) => {
        if (!userId) {
            toast.error("User ID is required")
            return
        }

        setLinking(devotee.id)
        try {
            const success = await linkUserToDevotee(userId, devotee.id)
            if (success) {
                toast.success("Devotee linked successfully")
                onLinked?.(devotee)
                setSearchQuery("")
                setDevotees([])
            } else {
                toast.error("Failed to link devotee")
            }
        } catch (error) {
            toast.error("Failed to link devotee")
        } finally {
            setLinking(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Search by name, mobile, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                </div>
            )}

            {!loading && devotees.length > 0 && (
                <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {devotees.map((devotee) => (
                        <div
                            key={devotee.id}
                            className="p-3 hover:bg-slate-50 flex items-center justify-between"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">
                                    {devotee.first_name} {devotee.middle_name || ""} {devotee.last_name || ""}
                                </p>
                                <div className="text-sm text-slate-600 space-x-4 mt-1">
                                    <span>{devotee.mobile_number}</span>
                                    {devotee.email && <span>{devotee.email}</span>}
                                    {devotee.devotee_code && (
                                        <span className="font-mono">{devotee.devotee_code}</span>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleLink(devotee)}
                                disabled={linking === devotee.id}
                                className="ml-4"
                            >
                                {linking === devotee.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <LinkIcon className="h-4 w-4 mr-1" />
                                        Link
                                    </>
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {!loading && searchQuery.length >= 2 && devotees.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                    No devotees found matching "{searchQuery}"
                </p>
            )}
        </div>
    )
}

