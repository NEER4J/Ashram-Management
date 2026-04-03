import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      donor_name, donor_phone, donor_email, donor_address,
      amount, category_id, purpose,
      payment_mode, payment_id, order_id,
    } = body

    if (!donor_name?.trim() || !donor_phone?.trim() || !amount) {
      return NextResponse.json({ error: "Name, phone, and amount are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Try to find linked devotee
    let devotee_id: string | null = null
    if (user) {
      const { data: profile } = await admin
        .from("user_profiles").select("devotee_id").eq("id", user.id).single()
      devotee_id = profile?.devotee_id || null
    }

    const mode = (payment_mode || "cash").toLowerCase()
    const pStatus = mode === "razorpay" ? "Completed" : "Pending"

    // Generate donation code
    const year = new Date().getFullYear()
    const { count } = await admin.from("donations").select("*", { count: "exact", head: true })
    const seq = ((count || 0) + 1).toString().padStart(5, "0")
    const donation_code = `DON-${year}-${seq}`

    const { data: donation, error } = await admin.from("donations").insert({
      donation_code,
      devotee_id,
      user_id: user?.id || null,
      donation_date: new Date().toISOString().split("T")[0],
      amount: Number(amount),
      category_id: category_id || null,
      purpose: purpose?.trim() || null,
      payment_mode: mode,
      transaction_ref: payment_id || order_id || null,
      payment_status: pStatus,
      receipt_generated: false,
    }).select("id, donation_code").single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, donation_id: donation.id, donation_code: donation.donation_code })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
