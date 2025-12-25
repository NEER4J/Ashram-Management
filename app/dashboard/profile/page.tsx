"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, User, Link as LinkIcon, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { getUserProfile, linkUserToDevotee } from "@/lib/auth/role-check"
import { DevoteeLinker } from "@/components/gurukul/devotee-linker"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [devotee, setDevotee] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                return
            }

            setUser(authUser)

            const { data: userProfile } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", authUser.id)
                .single()

            setProfile(userProfile)

            if (userProfile?.devotee_id) {
                const { data: devoteeData } = await supabase
                    .from("devotees")
                    .select("*")
                    .eq("id", userProfile.devotee_id)
                    .single()

                if (devoteeData) {
                    setDevotee(devoteeData)
                }
            }

            setLoading(false)
        }

        fetchData()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Profile</h1>
                <p className="text-slate-600 mt-1">
                    Manage your account and link to devotee record
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Account Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your login credentials and account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Email</label>
                            <Input value={user?.email || ""} disabled className="mt-1" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">User ID</label>
                            <Input value={user?.id || ""} disabled className="mt-1 font-mono text-xs" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600">Account Type</label>
                            <Input value={profile?.role === 'admin' ? 'Administrator' : 'User'} disabled className="mt-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* Linked Devotee */}
                <Card>
                    <CardHeader>
                        <CardTitle>Linked Devotee</CardTitle>
                        <CardDescription>
                            {devotee 
                                ? "Your account is linked to a devotee record"
                                : "Link your account to a devotee record to sync information"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {devotee ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Linked</span>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Name</label>
                                        <p className="text-slate-900">
                                            {devotee.first_name} {devotee.middle_name || ""} {devotee.last_name || ""}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Mobile</label>
                                        <p className="text-slate-900">{devotee.mobile_number}</p>
                                    </div>
                                    {devotee.email && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600">Email</label>
                                            <p className="text-slate-900">{devotee.email}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Devotee Code</label>
                                        <p className="text-slate-900 font-mono">{devotee.devotee_code || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    No devotee linked. You can link your account to an existing devotee record below.
                                </p>
                                <DevoteeLinker
                                    userId={user?.id}
                                    onLinked={(devoteeData) => {
                                        setDevotee(devoteeData)
                                        toast.success("Devotee linked successfully")
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

