import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params
    const body = await request.json()
    const {
      guest_name, guest_phone, guest_email,
      check_in_date, check_out_date,
      number_of_guests, special_requests, meal_preference,
      payment_mode, payment_ref,
    } = body

    if (!guest_name?.trim() || !guest_phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 })
    }
    if (!check_in_date || !check_out_date) {
      return NextResponse.json({ error: "Check-in and check-out dates are required" }, { status: 400 })
    }

    const supabase = await createClient()
    const admin = createServiceRoleClient()

    const { data: room } = await admin
      .from("rooms")
      .select("id, name, base_price_per_night")
      .eq("id", roomId)
      .eq("is_active", true)
      .single()

    if (!room) return NextResponse.json({ error: "Room not found or unavailable" }, { status: 404 })

    const cin  = new Date(check_in_date)
    const cout = new Date(check_out_date)
    const nights = Math.max(1, Math.ceil((cout.getTime() - cin.getTime()) / 86400000))
    const pricePerNight = Number(room.base_price_per_night) || 0
    const total_amount  = pricePerNight * nights

    const { data: { user } } = await supabase.auth.getUser()

    let devotee_id: string | null = null
    if (user) {
      const { data: profile } = await admin
        .from("user_profiles").select("devotee_id").eq("id", user.id).single()
      devotee_id = profile?.devotee_id || null
    }

    const isFree  = pricePerNight === 0
    const mode    = isFree ? "free" : (payment_mode || "pay_at_ashram")
    const pStatus = mode === "razorpay" ? "Completed" : mode === "free" ? "Completed" : "Pending"

    const year          = new Date().getFullYear()
    const { count }     = await admin.from("accommodation_bookings").select("*", { count: "exact", head: true })
    const seq           = ((count || 0) + 1).toString().padStart(5, "0")
    const booking_code  = `BK-${year}-${seq}`

    const { data: booking, error } = await admin
      .from("accommodation_bookings")
      .insert({
        booking_code,
        room_id:          roomId,
        user_id:          user?.id || null,
        devotee_id,
        guest_name:       guest_name.trim(),
        guest_phone:      guest_phone.trim(),
        guest_email:      guest_email?.trim() || null,
        check_in_date,
        check_out_date,
        number_of_guests: parseInt(number_of_guests) || 1,
        special_requests: special_requests?.trim() || null,
        meal_preference:  meal_preference?.trim() || null,
        total_amount,
        status:           "Pending",
        payment_mode:     mode,
        payment_ref:      payment_ref || null,
        payment_status:   pStatus,
      })
      .select("id, booking_code")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, booking_id: booking.id, booking_code: booking.booking_code })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
