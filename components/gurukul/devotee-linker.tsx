"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"
import { linkUserToDevotee } from "@/lib/auth/role-check"

interface DevoteeLinkerProps {
    userId: string
    onLinked?: (devotee: any) => void
}

export function DevoteeLinker({ userId, onLinked }: DevoteeLinkerProps) {
    const [searchType, setSearchType] = useState<"phone" | "email" | "code">("phone")
    const [searchValue, setSearchValue] = useState("")
    const [searching, setSearching] = useState(false)
    const [devotees, setDevotees] = useState<any[]>([])
    const [linking, setLinking] = useState(false)
    const supabase = createClient()

    const handleSearch = async () => {
        if (!searchValue.trim()) {
            toast.error("Please enter a search value")
            return
        }

        setSearching(true)
        try {
            let query = supabase.from("devotees").select("*")

            if (searchType === "phone") {
                query = query.or(`mobile_number.eq.${searchValue},whatsapp_number.eq.${searchValue}`)
            } else if (searchType === "email") {
                query = query.eq("email", searchValue)
            } else if (searchType === "code") {
                query = query.eq("devotee_code", searchValue)
            }

            const { data, error } = await query.limit(10)

            if (error) throw error

            if (data && data.length > 0) {
                setDevotees(data)
            } else {
                setDevotees([])
                toast.info("No devotees found matching your search")
            }
        } catch (error) {
            console.error("Error searching devotees:", error)
            toast.error("Failed to search devotees")
        } finally {
            setSearching(false)
        }
    }

    const handleLink = async (devoteeId: string) => {
        setLinking(true)
        try {
            const success = await linkUserToDevotee(userId, devoteeId)
            if (success) {
                const { data: devoteeData } = await supabase
                    .from("devotees")
                    .select("*")
                    .eq("id", devoteeId)
                    .single()

                if (devoteeData) {
                    onLinked?.(devoteeData)
                }
            } else {
                toast.error("Failed to link devotee")
            }
        } catch (error) {
            console.error("Error linking devotee:", error)
            toast.error("Failed to link devotee")
        } finally {
            setLinking(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Select value={searchType} onValueChange={(value: "phone" | "email" | "code") => setSearchType(value)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="code">Devotee Code</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    placeholder={searchType === "phone" ? "Enter phone number" : searchType === "email" ? "Enter email" : "Enter devotee code"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch()
                        }
                    }}
                    className="flex-1"
                />
                <Button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                >
                    {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {devotees.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Select devotee to link:</p>
                    {devotees.map((devotee) => (
                        <div
                            key={devotee.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div>
                                <p className="font-medium text-slate-900">
                                    {devotee.first_name} {devotee.middle_name || ""} {devotee.last_name || ""}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {devotee.mobile_number} {devotee.email && `• ${devotee.email}`}
                                </p>
                                {devotee.devotee_code && (
                                    <p className="text-xs text-slate-500 font-mono">{devotee.devotee_code}</p>
                                )}
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleLink(devotee.id)}
                                disabled={linking}
                                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                            >
                                {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Link"}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

