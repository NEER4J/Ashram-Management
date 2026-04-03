"use client"

import { useState, use } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Envelope, Lock, ArrowRight, ArrowLeft, CheckCircle, Bed, BookOpen, HandHeart } from "@phosphor-icons/react"

interface Props { params: Promise<{ slug: string }> }

const FEATURES = [
  { Icon: Bed, text: "Track your stay bookings" },
  { Icon: BookOpen, text: "Access enrolled courses" },
  { Icon: HandHeart, text: "View donation history" },
]

export default function AshramLoginPage({ params }: Props) {
  const { slug } = use(params)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      const next = new URLSearchParams(window.location.search).get("next")
      window.location.href = next || `/a/${slug}/my`
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-zinc-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Geometric mandala pattern */}
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
          <circle cx="300" cy="350" r="80" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <circle cx="300" cy="350" r="30" stroke="white" strokeWidth="0.5" strokeOpacity="0.2" />
          {/* Radial lines */}
          <line x1="300" y1="70" x2="300" y2="630" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="20" y1="350" x2="580" y2="350" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="102" y1="152" x2="498" y2="548" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="498" y1="152" x2="102" y2="548" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
          <line x1="20" y1="152" x2="580" y2="548" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="580" y1="152" x2="20" y2="548" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="152" y1="70" x2="448" y2="630" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          <line x1="448" y1="70" x2="152" y2="630" stroke="white" strokeWidth="0.3" strokeOpacity="0.05" />
          {/* Inner petals */}
          <path d="M300 270 Q340 310 300 350 Q260 310 300 270Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M300 430 Q260 390 300 350 Q340 390 300 430Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M220 350 Q260 310 300 350 Q260 390 220 350Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
          <path d="M380 350 Q340 390 300 350 Q340 310 380 350Z" stroke="white" strokeWidth="0.5" strokeOpacity="0.15" />
        </svg>

        {/* Brand */}
        <div className="relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center mb-10">
            <div className="w-4 h-4 rounded-full bg-white/90" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="w-10 h-[3px] bg-[#DC2626] mb-6" />
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-5">
            Your Spiritual<br />Journey Awaits
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-xs">
            Sign in to manage your ashram experience — bookings, pujas, courses, and more in one place.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 border border-white/10">
                  <Icon size={15} weight="regular" className="text-white/60" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[11px] text-white/25 tracking-wider">
            New to this ashram?{" "}
            <Link href={`/a/${slug}/signup`} className="text-white/50 hover:text-white underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          {/* Mobile brand mark */}
          <div className="lg:hidden mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center mb-4">
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2">Sign In</h1>
            <p className="text-sm text-zinc-400">Access your portal, bookings and courses.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Email address
              </label>
              <div className="relative">
                <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

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
              {loading ? "Signing in…" : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-400">
              New here?{" "}
              <Link href={`/a/${slug}/signup`} className="text-[#DC2626] font-semibold hover:underline">
                Create a free account
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
