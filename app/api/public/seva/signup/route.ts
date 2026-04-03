import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, opportunity_id, skills, availability_notes, seva_interest } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()

    let devotee_id: string | null = null
    if (user) {
      const { data: profile } = await admin
        .from("user_profiles").select("devotee_id").eq("id", user.id).single()
      devotee_id = profile?.devotee_id || null
    }

    // Check for existing volunteer record for this user
    if (user) {
      const { data: existing } = await admin
        .from("volunteers").select("id").eq("user_id", user.id).maybeSingle()

      if (existing) {
        return NextResponse.json({ success: true, volunteer_id: existing.id, already_registered: true })
      }
    }

    const { data: volunteer, error } = await admin.from("volunteers").insert({
      devotee_id,
      user_id: user?.id || null,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      skills: skills ? (Array.isArray(skills) ? skills : [skills]) : [],
      interests: opportunity_id ? [opportunity_id] : [],
      seva_interest: seva_interest || null,
      availability_notes: availability_notes?.trim() || null,
      status: "pending",
      joined_at: new Date().toISOString().split("T")[0],
    }).select("id").single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, volunteer_id: volunteer.id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
