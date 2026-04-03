import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, org, orgType, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("contact_inquiries").insert({
      name,
      email,
      organisation_name: org || null,
      organisation_type: orgType || null,
      subject: subject || null,
      message,
    });

    if (error) {
      console.error("Contact form error:", error);
      // Don't fail the request — just log it
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
