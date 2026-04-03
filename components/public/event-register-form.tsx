"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RazorpayCheckout } from "./razorpay-checkout"
import { PaymentMethodSelector } from "./payment-method-selector"

interface Props {
  eventId: string
  slug: string
  registrationFee: number
  eventName: string
  isLoggedIn: boolean
}

export function EventRegisterForm({ eventId, slug, registrationFee, eventName, isLoggedIn }: Props) {
  const router  = useRouter()
  const isFree  = registrationFee === 0
  const [form, setForm]               = useState({ name: "", phone: "", email: "", city: "", participants: "1" })
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "pay_at_ashram">("pay_at_ashram")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (opts: { payment_id?: string; order_id?: string } = {}) => {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/public/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        number_of_participants: parseInt(form.participants),
        payment_mode: isFree ? "free" : paymentMode,
        ...opts,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Registration failed"); return }
    router.push(
      `/a/${slug}/checkout?type=event&name=${encodeURIComponent(eventName)}${data.registration_code ? `&code=${encodeURIComponent(data.registration_code)}` : ""}`
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {[
        { key: "name",  label: "Full Name",        type: "text",  placeholder: "Your name",       req: true },
        { key: "phone", label: "Phone",             type: "tel",   placeholder: "+91 98765 43210", req: true },
        { key: "email", label: "Email (optional)",  type: "email", placeholder: "you@example.com",req: false },
        { key: "city",  label: "City (optional)",   type: "text",  placeholder: "Delhi",           req: false },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{f.label}</label>
          <input type={f.type} value={form[f.key as keyof typeof form]}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder} required={f.req}
            className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      ))}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Participants</label>
        <select value={form.participants} onChange={e => set("participants", e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-zinc-400">
          <Link href={`/a/${slug}/login?next=/a/${slug}/events/${eventId}`} className="text-[#DC2626] font-semibold hover:underline">
            Sign in
          </Link>{" "}to track this registration in your portal.
        </p>
      )}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      {isFree ? (
        <button type="button" disabled={loading || !form.name || !form.phone} onClick={() => submit()}
          className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60 mt-1">
          {loading ? "Registering…" : "Register Free"}
        </button>
      ) : (
        <div className="space-y-3 pt-1">
          <PaymentMethodSelector mode={paymentMode} onChange={setPaymentMode} />
          {paymentMode === "razorpay" ? (
            <RazorpayCheckout
              amount={registrationFee}
              name={eventName}
              description="Event Registration"
              prefill={{ name: form.name, contact: form.phone, email: form.email }}
              onSuccess={(paymentId, orderId) => submit({ payment_id: paymentId, order_id: orderId })}
              onFailure={() => setError("Payment failed or was cancelled.")}
              disabled={!form.name || !form.phone}
              label={`Pay ₹${registrationFee.toLocaleString("en-IN")}`}
              className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            />
          ) : (
            <button type="button" disabled={loading || !form.name || !form.phone} onClick={() => submit()}
              className="w-full bg-zinc-950 text-white font-semibold text-sm py-3 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-60">
              {loading ? "Registering…" : "Register — Pay at Ashram"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
