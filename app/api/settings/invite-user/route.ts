import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    // Verify the caller is an admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: admin only" }, { status: 403 })
    }

    const body = await req.json()
    const { email, role } = body as { email: string; role?: string }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Send invite using service role client
    const adminClient = createServiceRoleClient()
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // If a role was specified, set it on the profile once created
    if (role && data.user) {
      await adminClient
        .from("user_profiles")
        .upsert({ id: data.user.id, role: role === "admin" ? "admin" : "user" })
    }

    return NextResponse.json({ success: true, userId: data.user?.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 })
  }
}
