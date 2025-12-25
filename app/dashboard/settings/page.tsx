"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                setUser(authUser)
            }
            setLoading(false)
        }

        fetchUser()
    }, [supabase])

    const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setUpdating(true)

        const formData = new FormData(e.currentTarget)
        const newPassword = formData.get("newPassword") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            setUpdating(false)
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            setUpdating(false)
            return
        }

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Password updated successfully")
            e.currentTarget.reset()
        }

        setUpdating(false)
    }

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
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-1">
                    Manage your account settings
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">New Password</label>
                            <Input
                                type="password"
                                name="newPassword"
                                placeholder="Enter new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 mb-2 block">Confirm Password</label>
                            <Input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={updating}
                            style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                        >
                            {updating ? "Updating..." : "Update Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

