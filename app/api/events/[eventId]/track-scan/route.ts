import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
    try {
        // Handle both Next.js 14 and 15 params format
        const resolvedParams = params instanceof Promise ? await params : params
        const { eventId } = resolvedParams
        const body = await request.json()
        const { session_id, user_agent } = body

        if (!session_id) {
            return NextResponse.json(
                { error: "Session ID is required" },
                { status: 400 }
            )
        }

        const supabase = await createClient()
        // Use service role client for inserting analytics (bypasses RLS, ensures reliability)
        const supabaseAdmin = createServiceRoleClient()

        // Verify event exists and is published
        const { data: event, error: eventError } = await supabase
            .from("temple_events")
            .select("id, name, is_published")
            .eq("id", eventId)
            .single()

        if (eventError || !event || !event.is_published) {
            return NextResponse.json(
                { error: "Event not found or not published" },
                { status: 404 }
            )
        }

        // Insert QR scan record using admin client to ensure it always works
        const { error } = await supabaseAdmin
            .from("event_registration_analytics")
            .insert({
                event_id: eventId,
                event_name: event.name, // Include event name for backwards compatibility
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

