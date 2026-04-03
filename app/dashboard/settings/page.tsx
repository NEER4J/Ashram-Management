"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AshramSettings } from "@/lib/settings/types"
import { SettingsLayout } from "./components/settings-layout"
import { Loader2, ShieldOff } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const supabase  = createClient()
  const [settings, setSettings] = useState<AshramSettings | null>(null)
  const [isAdmin,  setIsAdmin]  = useState<boolean | null>(null) // null = loading
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); setLoading(false); return }

      const [profileRes, settingsRes] = await Promise.all([
        supabase.from("user_profiles").select("role").eq("id", user.id).single(),
        supabase.from("ashram_settings").select("*").eq("id", 1).single(),
      ])

      const role = profileRes.data?.role ?? "user"
      setIsAdmin(role === "admin")

      if (settingsRes.data) setSettings(settingsRes.data as AshramSettings)
      else if (settingsRes.error) toast.error("Could not load settings")

      setLoading(false)
    }
    bootstrap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(updates: Partial<AshramSettings>) {
    const { error } = await supabase
      .from("ashram_settings")
      .update(updates)
      .eq("id", 1)
    if (error) {
      toast.error("Failed to save settings")
    } else {
      setSettings(prev => prev ? { ...prev, ...updates } : prev)
      toast.success("Settings saved")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-4">
        <ShieldOff className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Only administrators can manage organisation settings. Contact your admin to request access.
          </p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center px-4">
        <p className="text-sm text-muted-foreground">Settings not found. Run the migration to create the settings table.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 md:px-8 py-5 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage organisation preferences, integrations, and access control.
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <SettingsLayout settings={settings} onSave={handleSave} />
      </div>
    </div>
  )
}
