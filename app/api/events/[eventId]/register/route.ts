import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { eventRegistrationSchema } from "@/app/events/schema"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
    try {
        // Handle both Next.js 14 and 15 params format
        const resolvedParams = params instanceof Promise ? await params : params
        const { eventId } = resolvedParams
        
        console.log("Event registration request for eventId:", eventId)
        
        const body = await request.json()
        const { session_id, ...formData } = body

        // Validate form data
        const validationResult = eventRegistrationSchema.safeParse(formData)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid form data", details: validationResult.error.errors },
                { status: 400 }
            )
        }

        const data = validationResult.data
        const supabase = await createClient()

        // Verify event exists and is published
        const { data: event, error: eventError } = await supabase
            .from("temple_events")
            .select("id, slug, is_published, name")
            .eq("id", eventId)
            .single()

        if (eventError) {
            console.error("Event query error:", eventError)
            console.error("EventId used in query:", eventId)
            return NextResponse.json(
                { error: `Event not found: ${eventError.message}` },
                { status: 404 }
            )
        }

        if (!event) {
            console.error("Event not found for eventId:", eventId)
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            )
        }

        console.log("Event found:", { id: event.id, slug: event.slug, is_published: event.is_published, name: event.name })

        if (!event.is_published) {
            console.warn("Event exists but is not published:", event.id)
            return NextResponse.json(
                { error: "This event is not currently published" },
                { status: 403 }
            )
        }

        // Generate devotee code
        const generateDevoteeCode = async (): Promise<string> => {
            const year = new Date().getFullYear()
            const prefix = `DEV-${year}-`

            // Get the latest devotee code for this year
            const { data: latestDevotee, error } = await supabase
                .from("devotees")
                .select("devotee_code")
                .like("devotee_code", `${prefix}%`)
                .order("devotee_code", { ascending: false })
                .limit(1)
                .maybeSingle()

            let nextNumber = 1
            if (!error && latestDevotee?.devotee_code) {
                // Extract the number from the code (e.g., "DEV-2024-0123" -> 123)
                const match = latestDevotee.devotee_code.match(/-(\d+)$/)
                if (match) {
                    nextNumber = parseInt(match[1], 10) + 1
                }
            }

            // Format with leading zeros (e.g., 0001, 0002, etc.)
            return `${prefix}${nextNumber.toString().padStart(4, "0")}`
        }

        // Split name into first_name and last_name
        const nameParts = data.name.trim().split(/\s+/)
        const first_name = nameParts[0] || ""
        const last_name = nameParts.slice(1).join(" ") || null

        // Insert devotee record
        const devoteeData = {
            first_name,
            last_name,
            mobile_number: data.phone,
            email: data.email || null,
            date_of_birth: data.dob, // Already a string in YYYY-MM-DD format from date input
            occupation: data.occupation,
            city: data.city || null,
            state: data.state || null,
            event_source: event.slug, // Store event slug for filtering
            devotee_code: await generateDevoteeCode(),
            country: "India",
            membership_type: "General",
            membership_status: "Active",
        }

        const { data: devotee, error: devoteeError } = await supabase
            .from("devotees")
            .insert(devoteeData)
            .select()
            .single()

        if (devoteeError) {
            console.error("Error creating devotee:", devoteeError)
            return NextResponse.json(
                { error: "Failed to create devotee record" },
                { status: 500 }
            )
        }

        // Update analytics record with devotee_id and submission timestamp
        if (session_id) {
            const { error: analyticsError } = await supabase
                .from("event_registration_analytics")
                .update({
                    devotee_id: devotee.id,
                    form_submitted_at: new Date().toISOString(),
                })
                .eq("session_id", session_id)
                .eq("event_id", eventId)
                .is("form_submitted_at", null) // Only update if not already submitted

            if (analyticsError) {
                console.error("Error updating analytics:", analyticsError)
                // Don't fail the request if analytics update fails
            }
        }

        return NextResponse.json({
            success: true,
            message: "Registration successful",
            devotee_id: devotee.id,
        })
    } catch (error) {
        console.error("Error in register route:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

