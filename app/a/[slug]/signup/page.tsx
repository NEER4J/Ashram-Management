"use client"

import { useState, use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Envelope, Lock, User, Phone, ArrowRight, ArrowLeft, CheckCircle } from "@phosphor-icons/react"

interface Props { params: Promise<{ slug: string }> }

const FIELDS = [
  { label: "Full Name",   key: "name",     type: "text",     placeholder: "Ramesh Sharma",       Icon: User },
  { label: "Phone",       key: "phone",    type: "tel",      placeholder: "+91 98765 43210",     Icon: Phone },
  { label: "Email",       key: "email",    type: "email",    placeholder: "you@example.com",     Icon: Envelope },
  { label: "Password",    key: "password", type: "password", placeholder: "Min. 8 characters",  Icon: Lock },
] as const

export default function AshramSignupPage({ params }: Props) {
  const { slug } = use(params)
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { role: "devotee", display_name: form.name.trim(), phone: form.phone.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/a/${slug}/my`,
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} weight="fill" className="text-emerald-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-3">Check your inbox</h2>
          <p className="text-sm text-zinc-500 leading-relaxed mb-8">
            We sent a confirmation link to <strong className="text-zinc-800">{form.email}</strong>.
            Click it to activate your account and get started.
          </p>
          <Link
            href={`/a/${slug}/login`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#DC2626] hover:underline"
          >
            Back to sign in
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-zinc-950 flex-col justify-between p-12 relative overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 600 700"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="300" cy="350" r="280" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
          <circle cx="300" cy="350" r="230" stroke="white" strokeWidth="0.5" strokeOpacity="0.1" />
          <circle cx="300" cy="350" r="180" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
          <circle cx="300" cy="350" r="130" stroke="white" strokeWidth="0.5" strokeOpacity="0.12" />
          <circle cx="300" cy="350" r="80"  stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <circle cx="300" cy="350" r="30"  stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
          <line x1="300" y1="70" x2="300" y2="630" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="20"  y1="350" x2="580" y2="350" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="102" y1="152" x2="498" y2="548" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="498" y1="152" x2="102" y2="548" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="20"  y1="152" x2="580" y2="548" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="580" y1="152" x2="20"  y2="548" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="152" y1="70"  x2="448" y2="630" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="448" y1="70"  x2="152" y2="630" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <path d="M300 270 Q340 310 300 350 Q260 310 300 270Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M300 430 Q260 390 300 350 Q340 390 300 430Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M220 350 Q260 310 300 350 Q260 390 220 350Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M380 350 Q340 390 300 350 Q340 310 380 350Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        </svg>

        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center mb-10">
            <div className="w-4 h-4 rounded-full bg-white/90" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-10 h-[3px] bg-[#DC2626] mb-6" />
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-5">
            Begin Your<br />Journey Today
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
            Create a free account and connect with the ashram — book stays, enroll in courses, participate in pujas, and more.
          </p>
          <div className="space-y-3">
            {["Free to join, always", "Book stays and pujas online", "Track your donations & courses"].map(text => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#DC2626]/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] text-white/25 tracking-wider">
            Already have an account?{" "}
            <Link href={`/a/${slug}/login`} className="text-white/50 hover:text-white underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center mb-4">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2">Create Account</h1>
            <p className="text-sm text-zinc-400">Join to book stays, enroll in courses, and more.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {FIELDS.map(({ label, key, type, placeholder, Icon }) => (
              <div key={key}>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  {label}
                </label>
                <div className="relative">
                  <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={type}
                    required
                    minLength={key === "password" ? 8 : undefined}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all"
                  />
                </div>
              </div>
            ))}

            {error && (
              <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                <span className="flex-shrink-0 mt-px">!</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#DC2626] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? "Creating account…" : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link href={`/a/${slug}/login`} className="text-[#DC2626] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href={`/a/${slug}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-zinc-500 transition-colors">
              <ArrowLeft size={12} />
              Back to ashram
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
