"use client"

type PaymentMode = "razorpay" | "pay_at_ashram"

interface PaymentMethodSelectorProps {
  mode: PaymentMode
  onChange: (mode: PaymentMode) => void
  className?: string
}

export function PaymentMethodSelector({ mode, onChange, className = "" }: PaymentMethodSelectorProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Payment Method</p>
      <div className="grid grid-cols-2 gap-2">
        {(["razorpay", "pay_at_ashram"] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`text-xs font-semibold py-2.5 rounded-xl border transition-colors ${
              mode === m
                ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
            }`}
          >
            {m === "razorpay" ? "Pay Online" : "Pay at Ashram"}
          </button>
        ))}
      </div>
    </div>
  )
}
