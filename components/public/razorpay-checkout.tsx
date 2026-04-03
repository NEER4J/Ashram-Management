"use client"

import { useState } from "react"
import Script from "next/script"

interface RazorpayCheckoutProps {
  amount: number
  name: string
  description: string
  prefill?: { name?: string; email?: string; contact?: string }
  onSuccess: (paymentId: string, orderId: string) => void
  onFailure?: () => void
  disabled?: boolean
  label?: string
  className?: string
}

declare global {
  interface Window { Razorpay: new (opts: object) => { open: () => void } }
}

export function RazorpayCheckout({
  amount, name, description, prefill,
  onSuccess, onFailure, disabled, label = "Pay Online",
  className = "",
}: RazorpayCheckoutProps) {
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!loaded) return
    setLoading(true)
    try {
      const res = await fetch("/api/public/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, receipt: `rcpt_${Date.now()}` }),
      })
      const { order_id, amount: orderAmount, currency, error: orderErr } = await res.json()
      if (orderErr) throw new Error(orderErr)

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency,
        order_id,
        name,
        description,
        prefill: prefill || {},
        theme: { color: "#DC2626" },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch("/api/public/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })
          const { verified } = await verifyRes.json()
          if (verified) {
            onSuccess(response.razorpay_payment_id, response.razorpay_order_id)
          } else {
            onFailure?.()
          }
          setLoading(false)
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch {
      onFailure?.()
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setLoaded(true)}
      />
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || loading || !loaded}
        className={className}
      >
        {loading ? "Processing…" : !loaded ? "Loading…" : label}
      </button>
    </>
  )
}
