import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount, receipt, notes } = await request.json()

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.description || "Failed to create order" }, { status: 500 })
    }

    const order = await res.json()
    return NextResponse.json({ order_id: order.id, amount: order.amount, currency: order.currency })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
