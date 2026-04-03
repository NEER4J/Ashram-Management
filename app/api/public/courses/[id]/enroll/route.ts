import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { payment_mode, payment_id, order_id } = body

    const supabase = await createClient()
    const admin = createServiceRoleClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Login required to enroll" }, { status: 401 })

    const { data: material } = await admin
      .from("study_materials")
      .select("id, title, price, is_free, type")
      .eq("id", id)
      .eq("is_published", true)
      .single()

    if (!material) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // Check existing enrollment
    const { data: existing } = await admin
      .from("course_enrollments")
      .select("id")
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ success: true, enrollment_id: existing.id, already_enrolled: true })

    const { data: profile } = await admin
      .from("user_profiles").select("devotee_id").eq("id", user.id).single()

    const isFree = material.is_free || Number(material.price) === 0
    const mode = isFree ? "free" : (payment_mode || "pay_at_ashram")
    const pStatus = isFree ? "paid" : mode === "razorpay" ? "paid" : "pending"

    // Create order if paid
    let orderId: string | null = null
    if (!isFree) {
      const year = new Date().getFullYear()
      const { count } = await admin.from("study_material_orders").select("*", { count: "exact", head: true })
      const seq = ((count || 0) + 1).toString().padStart(4, "0")
      orderId = `ORD-${year}-${seq}`

      const { error: orderError } = await admin.from("study_material_orders").insert({
        order_code: orderId,
        devotee_id: profile?.devotee_id || null,
        user_id: user.id,
        material_id: id,
        amount: Number(material.price),
        payment_mode: mode,
        payment_status: pStatus,
        transaction_ref: payment_id || order_id || null,
      })
      if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    const { data: enrollment, error } = await admin.from("course_enrollments").insert({
      course_id: id,
      devotee_id: profile?.devotee_id || null,
      user_id: user.id,
      progress_percent: 0,
      payment_status: pStatus,
    }).select("id").single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, enrollment_id: enrollment.id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
