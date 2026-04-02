import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: donation, error } = await supabase
        .from("donations")
        .update({
            receipt_generated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id, donation_code, amount, donation_date, receipt_number, receipt_generated_at, devotee_id, is_anonymous, currency, devotees(first_name, last_name)")
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(donation)
}
