"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RazorpayCheckout } from "./razorpay-checkout"
import { PaymentMethodSelector } from "./payment-method-selector"

interface Props {
  pujaId: string
  pujaName: string
  amount: number
  slug: string
  nakshatras: string[]
  rashis: string[]
  defaultName?: string
  defaultPhone?: string
  defaultNakshatra?: string
  defaultRashi?: string
  defaultGotra?: string
}

export function PujaBookForm({
  pujaId, pujaName, amount, slug, nakshatras, rashis,
  defaultName = "", defaultPhone = "",
  defaultNakshatra = "", defaultRashi = "", defaultGotra = "",
}: Props) {
  const router  = useRouter()
  const today   = new Date().toISOString().split("T")[0]
  const isFree  = amount === 0

  const [form, setForm] = useState({ puja_date: today, puja_time: "06:00" })
  const [participants, setParticipants] = useState([
    { name: defaultName, nakshatra: defaultNakshatra, rashi: defaultRashi, gotra: defaultGotra }
  ])
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "pay_at_ashram">("pay_at_ashram")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  const setParticipant = (i: number, k: string, v: string) =>
    setParticipants(ps => ps.map((p, idx) => idx === i ? { ...p, [k]: v } : p))

  const submit = async (opts: { payment_id?: string; order_id?: string } = {}) => {
    if (!participants[0]?.name?.trim()) { setError("Participant name is required"); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/public/pujas/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puja_id: pujaId,
        ...form,
        participant_details: participants,
        payment_mode: isFree ? "free" : paymentMode,
        ...opts,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Booking failed"); return }
    router.push(
      `/a/${slug}/checkout?type=puja&code=${encodeURIComponent(data.booking_code || "")}&name=${encodeURIComponent(pujaName)}`
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Preferred Date</label>
          <input type="date" min={today} value={form.puja_date}
            onChange={e => setForm(f => ({ ...f, puja_date: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Preferred Time</label>
          <input type="time" value={form.puja_time}
            onChange={e => setForm(f => ({ ...f, puja_time: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Participants</label>
          {participants.length < 6 && (
            <button type="button"
              onClick={() => setParticipants(ps => [...ps, { name: "", nakshatra: "", rashi: "", gotra: "" }])}
              className="text-xs text-[#DC2626] font-semibold hover:underline">+ Add</button>
          )}
        </div>
        <div className="space-y-3">
          {participants.map((p, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-400">Person {i + 1}</span>
                {i > 0 && (
                  <button type="button" onClick={() => setParticipants(ps => ps.filter((_, idx) => idx !== i))}
                    className="text-xs text-zinc-400 hover:text-red-500">Remove</button>
                )}
              </div>
              <input type="text" placeholder="Full name *" value={p.name}
                onChange={e => setParticipant(i, "name", e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
              <div className="grid grid-cols-2 gap-2">
                <select value={p.nakshatra} onChange={e => setParticipant(i, "nakshatra", e.target.value)}
                  className="border border-zinc-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#DC2626]">
                  <option value="">Nakshatra</option>
                  {nakshatras.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={p.rashi} onChange={e => setParticipant(i, "rashi", e.target.value)}
                  className="border border-zinc-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#DC2626]">
                  <option value="">Rashi</option>
                  {rashis.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Gotra (optional)" value={p.gotra}
                onChange={e => setParticipant(i, "gotra", e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#DC2626]" />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      {isFree ? (
        <button type="button" disabled={loading} onClick={() => submit()}
          className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
          {loading ? "Booking…" : "Book Puja"}
        </button>
      ) : (
        <div className="space-y-2">
          <PaymentMethodSelector mode={paymentMode} onChange={setPaymentMode} />
          {paymentMode === "razorpay" ? (
            <RazorpayCheckout
              amount={amount}
              name={pujaName}
              description="Puja Booking"
              onSuccess={(paymentId, orderId) => submit({ payment_id: paymentId, order_id: orderId })}
              onFailure={() => setError("Payment failed.")}
              label={`Pay ₹${amount.toLocaleString("en-IN")}`}
              className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            />
          ) : (
            <button type="button" disabled={loading} onClick={() => submit()}
              className="w-full bg-zinc-950 text-white font-semibold text-sm py-3 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-60">
              {loading ? "Booking…" : "Book — Pay at Ashram"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
