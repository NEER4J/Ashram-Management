import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
    request: NextRequest,
    { params }: { params: { eventId: string } }
) {
    try {
        const { eventId } = params
        const body = await request.json()
        const { session_id, user_agent } = body

        if (!session_id) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Verify event exists and is published
        const { data: event, error: eventError } = await supabase
            .from("temple_events")
            .select("id, is_published")
            .eq("id", eventId)
            .single()

        if (eventError || !event || !event.is_published) {
            return NextResponse.json(
                { error: "Event not found or not published" },
                { status: 404 }
            )
        }

        // Insert QR scan record
        const { error } = await supabase
            .from("event_registration_analytics")
            .insert({
                event_id: eventId,
                session_id: session_id,
                user_agent: user_agent || null,
                ip_address: request.headers.get("x-forwarded-for") || 
                           request.headers.get("x-real-ip") || 
                           null,
            })

        if (error) {
            console.error("Error tracking QR scan:", error)
            return NextResponse.json(
                { error: "Failed to track QR scan" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, session_id })
    } catch (error) {
        console.error("Error in track-scan route:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

