"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RazorpayCheckout } from "./razorpay-checkout"
import { PaymentMethodSelector } from "./payment-method-selector"

interface Props {
  roomId: string
  slug: string
  pricePerNight: number
  roomName: string
  isLoggedIn: boolean
}

export function BookingForm({ roomId, slug, pricePerNight, roomName }: Props) {
  const router  = useRouter()
  const today   = new Date().toISOString().split("T")[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0]

  const [form, setForm] = useState({
    guest_name: "", guest_phone: "", guest_email: "",
    check_in_date: today, check_out_date: tomorrow,
    number_of_guests: "1", special_requests: "", meal_preference: "",
  })
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "pay_at_ashram">("pay_at_ashram")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const nights = Math.max(1, Math.ceil(
    (new Date(form.check_out_date).getTime() - new Date(form.check_in_date).getTime()) / 86400000
  ))
  const totalAmount = pricePerNight * nights
  const isFree      = pricePerNight === 0

  const submit = async (opts: { payment_id?: string; order_id?: string } = {}) => {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/public/rooms/${roomId}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        number_of_guests: parseInt(form.number_of_guests),
        payment_mode: isFree ? "free" : paymentMode,
        payment_ref: opts.payment_id || opts.order_id || null,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Booking failed"); return }
    router.push(
      `/a/${slug}/checkout?type=booking&code=${encodeURIComponent(data.booking_code || "")}&name=${encodeURIComponent(roomName)}`
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Check-in</label>
          <input type="date" min={today} value={form.check_in_date}
            onChange={e => set("check_in_date", e.target.value)}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Check-out</label>
          <input type="date" min={form.check_in_date} value={form.check_out_date}
            onChange={e => set("check_out_date", e.target.value)}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      </div>

      {[
        { key: "guest_name",  label: "Your Name",         type: "text",  placeholder: "Full name",         req: true },
        { key: "guest_phone", label: "Phone",              type: "tel",   placeholder: "+91 98765 43210",   req: true },
        { key: "guest_email", label: "Email (optional)",   type: "email", placeholder: "you@example.com",  req: false },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{f.label}</label>
          <input type={f.type} value={form[f.key as keyof typeof form]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder} required={f.req}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      ))}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Guests</label>
        <select value={form.number_of_guests} onChange={e => set("number_of_guests", e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]">
          {[1,2,3,4].map(n => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Special Requests</label>
        <textarea value={form.special_requests} onChange={e => set("special_requests", e.target.value)} rows={2}
          placeholder="Dietary needs, early check-in, etc."
          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626] resize-none" />
      </div>

      {!isFree && (
        <div className="bg-white rounded-xl px-4 py-3 border border-zinc-200">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">₹{pricePerNight.toLocaleString("en-IN")} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span className="font-bold text-zinc-950">₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      {isFree ? (
        <button type="button" disabled={loading || !form.guest_name || !form.guest_phone} onClick={() => submit()}
          className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
          {loading ? "Booking…" : "Book Now (Free)"}
        </button>
      ) : (
        <div className="space-y-2">
          <PaymentMethodSelector mode={paymentMode} onChange={setPaymentMode} />
          {paymentMode === "razorpay" ? (
            <RazorpayCheckout
              amount={totalAmount}
              name={roomName}
              description={`${nights} night stay`}
              prefill={{ name: form.guest_name, contact: form.guest_phone, email: form.guest_email }}
              onSuccess={(paymentId, orderId) => submit({ payment_id: paymentId, order_id: orderId })}
              onFailure={() => setError("Payment failed or was cancelled.")}
              disabled={!form.guest_name || !form.guest_phone}
              label={`Pay ₹${totalAmount.toLocaleString("en-IN")}`}
              className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            />
          ) : (
            <button type="button" disabled={loading || !form.guest_name || !form.guest_phone} onClick={() => submit()}
              className="w-full bg-zinc-950 text-white font-semibold text-sm py-3 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-60">
              {loading ? "Booking…" : "Book — Pay at Ashram"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
