import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const {
      name, phone, email, city, number_of_participants,
      payment_mode, payment_id, order_id,
    } = body

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createServiceRoleClient()

    // Verify event exists and is open
    const { data: event } = await admin
      .from("temple_events")
      .select("id, name, registration_fee, is_registration_open, max_registrations")
      .eq("id", eventId)
      .eq("is_published", true)
      .single()

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 })
    if (!event.is_registration_open) {
      return NextResponse.json({ error: "Registration is closed" }, { status: 400 })
    }

    // Get logged-in user if any
    const { data: { user } } = await supabase.auth.getUser()

    // Try to find or create devotee
    let devotee_id: string | null = null
    if (user) {
      const { data: profile } = await admin
        .from("user_profiles")
        .select("devotee_id")
        .eq("id", user.id)
        .single()
      devotee_id = profile?.devotee_id || null
    }

    const fee = Number(event.registration_fee) || 0
    const mode = fee > 0 ? (payment_mode || "pay_at_ashram") : "free"
    const pStatus = mode === "free" ? "paid" : mode === "razorpay" ? "paid" : "pending"

    // Generate registration code
    const year = new Date().getFullYear()
    const { count: regCount } = await admin
      .from("event_registrations").select("*", { count: "exact", head: true })
    const seq = ((regCount || 0) + 1).toString().padStart(5, "0")
    const registration_code = `REG-${year}-${seq}`

    const { data: reg, error } = await admin.from("event_registrations").insert({
      event_id: eventId,
      devotee_id: devotee_id,
      user_id: user?.id || null,
      number_of_participants: number_of_participants || 1,
      status: "Registered",
      fee_paid: mode === "razorpay" ? fee : 0,
      payment_mode: mode,
      payment_ref: payment_id || order_id || null,
      payment_status: pStatus,
      registration_code,
    }).select("id, registration_code").single()

    if (error) {
      // If registration_code column doesn't exist yet (migration not applied), retry without it
      if (error.message.includes("registration_code")) {
        const { data: reg2, error: err2 } = await admin.from("event_registrations").insert({
          event_id: eventId,
          devotee_id: devotee_id,
          user_id: user?.id || null,
          number_of_participants: number_of_participants || 1,
          status: "Registered",
          fee_paid: mode === "razorpay" ? fee : 0,
          payment_mode: mode,
          payment_ref: payment_id || order_id || null,
          payment_status: pStatus,
        }).select("id").single()
        if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })
        return NextResponse.json({ success: true, registration_id: reg2.id })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, registration_id: reg.id, registration_code: reg.registration_code })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
