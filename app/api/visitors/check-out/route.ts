import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { visitor_pass_code, visitor_id } = body
        const id = visitor_id || (typeof visitor_pass_code === "string" && visitor_pass_code.trim() ? visitor_pass_code.trim() : null)
        if (!id) {
            return NextResponse.json(
                { error: "visitor_pass_code or visitor_id required" },
                { status: 400 }
            )
        }
        const supabase = await createClient()
        const column = visitor_id ? "id" : "visitor_pass_code"
        const { data: visitor, error: fetchError } = await supabase
            .from("visitor_registrations")
            .select("id, check_in_at, check_out_at")
            .eq(column, id)
            .single()

        if (fetchError || !visitor) {
            return NextResponse.json(
                { error: "Visitor not found" },
                { status: 404 }
            )
        }
        if (!visitor.check_in_at) {
            return NextResponse.json(
                { error: "Not checked in yet" },
                { status: 400 }
            )
        }
        if (visitor.check_out_at) {
            return NextResponse.json(
                { message: "Already checked out", visitor_id: visitor.id },
                { status: 200 }
            )
        }
        const { error: updateError } = await supabase
            .from("visitor_registrations")
            .update({ check_out_at: new Date().toISOString() })
            .eq("id", visitor.id)

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            )
        }
        return NextResponse.json({
            message: "Checked out",
            visitor_id: visitor.id,
            check_out_at: new Date().toISOString(),
        })
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        )
    }
}
