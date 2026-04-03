import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { order_id, payment_id, signature } = await request.json()

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${order_id}|${payment_id}`)
      .digest("hex")

    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
