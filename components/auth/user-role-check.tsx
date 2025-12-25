"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile, UserRole } from "@/lib/auth/role-check"
import { Loader2 } from "lucide-react"

interface UserRoleCheckProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function UserRoleCheck({ children, allowedRoles, redirectTo = "/dashboard/my-learning" }: UserRoleCheckProps) {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      const profile = await getUserProfile(user.id)
      
      if (!profile) {
        router.push(redirectTo)
        return
      }

      if (allowedRoles.includes(profile.role)) {
        setHasAccess(true)
      } else {
        router.push(redirectTo)
      }

      setLoading(false)
    }

    checkAccess()
  }, [supabase, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}

