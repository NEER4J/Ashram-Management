"use client"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Phone, Envelope, CheckCircle, SignOut, FloppyDisk } from "@phosphor-icons/react"

interface Props { params: Promise<{ slug: string }> }

const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati",
]

const RASHIS = [
  "Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
  "Tula","Vrischika","Dhanu","Makara","Kumbha","Meena",
]

export default function MyProfilePage({ params }: Props) {
  const { slug } = use(params)
  const [form, setForm] = useState({
    display_name: "", phone: "", email: "",
    nakshatra: "", rashi: "", gotra: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState("")
  const [userId, setUserId]   = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("display_name, phone, nakshatra, rashi, gotra")
        .eq("id", user.id)
        .single()
      setForm({
        display_name: profile?.display_name || "",
        phone:        profile?.phone || "",
        email:        user.email || "",
        nakshatra:    profile?.nakshatra || "",
        rashi:        profile?.rashi || "",
        gotra:        profile?.gotra || "",
      })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setError("")
    const supabase = createClient()
    const { error: err } = await supabase.from("user_profiles")
      .update({
        display_name: form.display_name.trim(),
        phone:        form.phone.trim(),
        nakshatra:    form.nakshatra || null,
        rashi:        form.rashi || null,
        gotra:        form.gotra.trim() || null,
      })
      .eq("id", userId)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = `/a/${slug}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-200 border-t-[#DC2626] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-md">
      <div>
        <h2 className="font-serif text-2xl font-bold text-zinc-950">My Profile</h2>
        <p className="text-sm text-zinc-400 mt-0.5">Update your personal information</p>
      </div>

      {/* Avatar display */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DC2626] flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white leading-none">
            {(form.display_name || form.email).slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-zinc-950">{form.display_name || "Devotee"}</p>
          <p className="text-sm text-zinc-400">{form.email}</p>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <form onSubmit={handleSave} className="space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Personal Info</p>

          {[
            { key: "display_name", label: "Display Name", type: "text",  placeholder: "Your name",       editable: true,  Icon: User },
            { key: "phone",        label: "Phone",         type: "tel",   placeholder: "+91 98765 43210", editable: true,  Icon: Phone },
            { key: "email",        label: "Email",         type: "email", placeholder: "",                editable: false, Icon: Envelope },
          ].map(({ key, label, type, placeholder, editable, Icon }) => (
            <div key={key}>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{label}</label>
              <div className="relative">
                <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(fm => ({ ...fm, [key]: e.target.value }))}
                  disabled={!editable}
                  placeholder={placeholder}
                  className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626] disabled:bg-zinc-50 disabled:text-zinc-400 transition-all"
                />
              </div>
            </div>
          ))}

          {/* Spiritual profile */}
          <div className="pt-4 border-t border-zinc-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Spiritual Profile</p>
            <p className="text-xs text-zinc-400 mb-4 -mt-2">Pre-fills puja booking forms automatically.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Nakshatra</label>
                <select value={form.nakshatra} onChange={e => setForm(fm => ({ ...fm, nakshatra: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]">
                  <option value="">Select Nakshatra</option>
                  {NAKSHATRAS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Rashi</label>
                <select value={form.rashi} onChange={e => setForm(fm => ({ ...fm, rashi: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]">
                  <option value="">Select Rashi</option>
                  {RASHIS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Gotra</label>
                <input
                  type="text"
                  value={form.gotra}
                  onChange={e => setForm(fm => ({ ...fm, gotra: e.target.value }))}
                  placeholder="e.g. Kashyapa"
                  className="w-full border border-zinc-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-100">
              {error}
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
              <CheckCircle size={14} weight="fill" />
              Profile updated successfully
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#DC2626] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          >
            <FloppyDisk size={16} weight="bold" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 border border-zinc-200 text-zinc-600 text-sm font-medium py-3.5 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all"
      >
        <SignOut size={16} />
        Sign Out
      </button>
    </div>
  )
}
