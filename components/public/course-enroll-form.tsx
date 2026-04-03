"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { RazorpayCheckout } from "./razorpay-checkout"
import { PaymentMethodSelector } from "./payment-method-selector"

interface Props {
  courseId: string
  slug: string
  price: number
  title: string
  isLoggedIn: boolean
}

export function CourseEnrollForm({ courseId, slug, price, title, isLoggedIn }: Props) {
  const router  = useRouter()
  const isFree  = price === 0
  const [paymentMode, setPaymentMode] = useState<"razorpay" | "pay_at_ashram">("razorpay")
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">Sign in to enroll in this {isFree ? "free" : "paid"} course.</p>
        <Link
          href={`/a/${slug}/login?next=/a/${slug}/courses/${courseId}`}
          className="block w-full text-center bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors"
        >
          Sign In to Enroll
        </Link>
        <Link
          href={`/a/${slug}/signup?next=/a/${slug}/courses/${courseId}`}
          className="block w-full text-center border border-zinc-200 text-zinc-700 font-semibold text-sm py-3 rounded-full hover:border-zinc-400 transition-colors"
        >
          Create Account
        </Link>
      </div>
    )
  }

  const enroll = async (opts: { payment_id?: string; order_id?: string } = {}) => {
    setLoading(true)
    setError("")
    const res = await fetch(`/api/public/courses/${courseId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_mode: isFree ? "free" : paymentMode,
        ...opts,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Enrollment failed"); return }
    router.push(`/a/${slug}/checkout?type=course&name=${encodeURIComponent(title)}`)
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        <button onClick={() => setError("")} className="text-sm text-zinc-500 hover:text-zinc-700">Try again</button>
      </div>
    )
  }

  if (isFree) {
    return (
      <button type="button" disabled={loading} onClick={() => enroll()}
        className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
        {loading ? "Enrolling…" : "Enroll Free"}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <PaymentMethodSelector mode={paymentMode} onChange={setPaymentMode} />
      {paymentMode === "razorpay" ? (
        <RazorpayCheckout
          amount={price}
          name={title}
          description="Course Enrollment"
          onSuccess={(paymentId, orderId) => enroll({ payment_id: paymentId, order_id: orderId })}
          onFailure={() => setError("Payment failed or was cancelled.")}
          label={`Pay ₹${price.toLocaleString("en-IN")}`}
          className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
        />
      ) : (
        <button type="button" disabled={loading} onClick={() => enroll()}
          className="w-full bg-zinc-950 text-white font-semibold text-sm py-3 rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-60">
          {loading ? "Processing…" : "Enroll — Pay at Ashram"}
        </button>
      )}
    </div>
  )
}
