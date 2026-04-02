import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { guest_name, guest_phone, guest_email, check_in_date, check_out_date, room_type_preference, number_of_guests, special_requests, add_to_waitlist, accommodation_id } = body
        if (!guest_name?.trim() || !guest_phone?.trim() || !check_in_date || !check_out_date) {
            return NextResponse.json(
                { error: "Name, phone, check-in and check-out dates are required" },
                { status: 400 }
            )
        }
        const supabase = createServiceRoleClient()
        if (add_to_waitlist) {
            const { data, error } = await supabase.from("booking_waitlist").insert({
                guest_name: guest_name.trim(),
                guest_phone: guest_phone.trim(),
                guest_email: guest_email?.trim() || null,
                desired_check_in: check_in_date,
                desired_check_out: check_out_date,
                room_type_preference: room_type_preference || null,
                notes: special_requests?.trim() || null,
                accommodation_id: accommodation_id || null,
            }).select("id").single()
            if (error) return NextResponse.json({ error: error.message }, { status: 500 })
            return NextResponse.json({ message: "Added to waitlist", id: data?.id })
        }
        let roomsQuery = supabase.from("rooms").select("id, base_price_per_night").eq("is_active", true).eq("room_type", room_type_preference || "double")
        if (accommodation_id) {
            roomsQuery = roomsQuery.eq("accommodation_id", accommodation_id)
        }
        const { data: rooms } = await roomsQuery.limit(1)
        const roomId = rooms?.[0]?.id || null
        const room = rooms?.[0]
        const nights = Math.ceil((new Date(check_out_date).getTime() - new Date(check_in_date).getTime()) / (1000 * 60 * 60 * 24))
        const total = room ? (room as { base_price_per_night: number }).base_price_per_night * nights : 0
        const { data: booking, error } = await supabase.from("accommodation_bookings").insert({
            guest_name: guest_name.trim(),
            guest_phone: guest_phone.trim(),
            guest_email: guest_email?.trim() || null,
            room_id: roomId,
            check_in_date,
            check_out_date,
            number_of_guests: number_of_guests || 1,
            special_requests: special_requests?.trim() || null,
            total_amount: total,
            status: "Pending",
            source: "online",
        }).select("id, booking_code").single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ message: "Booking request submitted", booking_id: booking?.id, booking_code: (booking as { booking_code: string })?.booking_code })
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
    }
}
