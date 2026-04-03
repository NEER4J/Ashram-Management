"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RazorpayCheckout } from "./razorpay-checkout"

const PRESET_AMOUNTS = [101, 251, 501, 1001, 2101, 5001]

interface Category { id: string; name: string; is_80g_eligible: boolean }

interface Props {
  slug: string
  categories: Category[]
  defaultName?: string
  defaultPhone?: string
  defaultEmail?: string
}

export function DonateForm({ slug, categories, defaultName = "", defaultPhone = "", defaultEmail = "" }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    donor_name: defaultName, donor_phone: defaultPhone, donor_email: defaultEmail,
    donor_address: "", category_id: "", purpose: "", custom_amount: "",
  })
  const [selectedAmount, setSelectedAmount]   = useState<number | null>(null)
  const [paymentMode, setPaymentMode]         = useState<"razorpay" | "upi" | "cash">("razorpay")
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState("")

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const finalAmount = selectedAmount || parseInt(form.custom_amount) || 0

  const submit = async (opts: { payment_id?: string; order_id?: string } = {}) => {
    if (!finalAmount || finalAmount < 1) { setError("Please enter a valid amount"); return }
    setLoading(true)
    setError("")
    const res = await fetch("/api/public/donate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: finalAmount,
        payment_mode: opts.payment_id ? "razorpay" : paymentMode,
        payment_id: opts.payment_id,
        order_id: opts.order_id,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Donation failed"); return }
    router.push(
      `/a/${slug}/checkout?type=donation&code=${encodeURIComponent(data.donation_code || "")}&name=${encodeURIComponent(`₹${finalAmount.toLocaleString("en-IN")}`)}`
    )
  }

  return (
    <div className="space-y-4">
      {/* Amount selection */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Amount (₹)</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {PRESET_AMOUNTS.map(amt => (
            <button key={amt} type="button" onClick={() => { setSelectedAmount(amt); set("custom_amount", "") }}
              className={`text-sm font-bold py-2.5 rounded-xl border transition-colors ${
                selectedAmount === amt
                  ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
              }`}>
              ₹{amt.toLocaleString("en-IN")}
            </button>
          ))}
        </div>
        <input type="number" min="1" placeholder="Or enter custom amount"
          value={form.custom_amount}
          onChange={e => { set("custom_amount", e.target.value); setSelectedAmount(null) }}
          className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Category</label>
          <select value={form.category_id} onChange={e => set("category_id", e.target.value)}
            className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]">
            <option value="">Select category (optional)</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}{c.is_80g_eligible ? " (80G)" : ""}</option>
            ))}
          </select>
        </div>
      )}

      {[
        { key: "donor_name",  label: "Your Name",          type: "text",  placeholder: "Full name",        req: true },
        { key: "donor_phone", label: "Phone",               type: "tel",   placeholder: "+91 98765 43210", req: true },
        { key: "donor_email", label: "Email (for receipt)", type: "email", placeholder: "you@example.com", req: false },
        { key: "purpose",     label: "Purpose / Message (optional)", type: "text", placeholder: "In memory of...", req: false },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{f.label}</label>
          <input type={f.type} required={f.req} value={form[f.key as keyof typeof form]}
            onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
            className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      ))}

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Payment Method</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(["razorpay", "upi", "cash"] as const).map(m => (
            <button key={m} type="button" onClick={() => setPaymentMode(m)}
              className={`text-xs font-semibold py-2.5 rounded-xl border transition-colors ${
                paymentMode === m
                  ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}>
              {m === "razorpay" ? "Online" : m === "upi" ? "UPI" : "Cash"}
            </button>
          ))}
        </div>

        {paymentMode === "razorpay" ? (
          <RazorpayCheckout
            amount={finalAmount}
            name="Donation"
            description={`Donation${form.purpose ? ` - ${form.purpose}` : ""}`}
            prefill={{ name: form.donor_name, contact: form.donor_phone, email: form.donor_email }}
            onSuccess={(paymentId, orderId) => submit({ payment_id: paymentId, order_id: orderId })}
            onFailure={() => setError("Payment failed or was cancelled.")}
            disabled={!form.donor_name || !form.donor_phone || !finalAmount}
            label={finalAmount ? `Donate ₹${finalAmount.toLocaleString("en-IN")}` : "Donate"}
            className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3.5 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          />
        ) : (
          <button type="button"
            disabled={loading || !form.donor_name || !form.donor_phone || !finalAmount}
            onClick={() => submit()}
            className="w-full bg-zinc-950 text-white font-semibold text-sm py-3.5 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-60">
            {loading ? "Processing…" : `Donate ₹${finalAmount ? finalAmount.toLocaleString("en-IN") : "…"} (${paymentMode === "upi" ? "UPI" : "Cash"})`}
          </button>
        )}
      </div>
    </div>
  )
}
