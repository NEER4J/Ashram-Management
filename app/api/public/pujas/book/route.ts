import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      puja_id, puja_date, puja_time,
      participant_details, // [{ name, nakshatra, rashi, gotra }]
      payment_mode, payment_id, order_id,
    } = body

    if (!puja_id || !puja_date) {
      return NextResponse.json({ error: "Puja and date are required" }, { status: 400 })
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

    const { data: puja } = await admin
      .from("master_pujas").select("base_amount").eq("id", puja_id).single()

    const mode = payment_mode || "pay_at_ashram"
    const pStatus = mode === "razorpay" ? "Paid" : "Pending"

    // Generate booking code
    const year = new Date().getFullYear()
    const { count } = await admin.from("puja_bookings").select("*", { count: "exact", head: true })
    const seq = ((count || 0) + 1).toString().padStart(4, "0")
    const booking_code = `PUJA-${year}-${seq}`

    const { data: booking, error } = await admin.from("puja_bookings").insert({
      booking_code,
      devotee_id,
      user_id: user?.id || null,
      puja_id,
      booking_date: new Date().toISOString().split("T")[0],
      puja_date,
      puja_time: puja_time || null,
      status: "Confirmed",
      payment_status: pStatus,
      amount_paid: mode === "razorpay" ? Number(puja?.base_amount || 0) : 0,
      participant_details: participant_details || null,
    }).select("id, booking_code").single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, booking_id: booking.id, booking_code: booking.booking_code })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
