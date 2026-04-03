"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SKILLS      = ["Kitchen", "Teaching", "IT / Tech", "Music", "Medical", "Events", "Carpentry", "Gardening", "Outreach", "Administration"]
const AVAILABILITY = ["Weekdays", "Weekends", "Full-time", "Event-based", "Remote only"]

interface Props {
  opportunityId: string | null
  slug: string
  defaultName?: string
  defaultPhone?: string
}

export function SevaSignupForm({ opportunityId, slug, defaultName = "", defaultPhone = "" }: Props) {
  const router = useRouter()
  const [form, setForm]                               = useState({ name: defaultName, phone: defaultPhone, email: "", availability_notes: "", seva_interest: "" })
  const [selectedSkills, setSelectedSkills]           = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [loading, setLoading]                         = useState(false)
  const [error, setError]                             = useState("")

  const set       = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const toggleSkill = (s: string) => setSelectedSkills(ss => ss.includes(s) ? ss.filter(x => x !== s) : [...ss, s])
  const toggleAvail = (a: string) => setSelectedAvailability(ss => ss.includes(a) ? ss.filter(x => x !== a) : [...ss, a])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/public/seva/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        opportunity_id: opportunityId,
        skills: selectedSkills,
        availability: selectedAvailability,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "Signup failed"); return }
    router.push(`/a/${slug}/checkout?type=seva`)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {[
        { key: "name",  label: "Full Name", type: "text",  placeholder: "Your name",       req: true },
        { key: "phone", label: "Phone",     type: "tel",   placeholder: "+91 98765 43210", req: true },
        { key: "email", label: "Email (optional)", type: "email", placeholder: "you@example.com", req: false },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{f.label}</label>
          <input type={f.type} required={f.req} value={form[f.key as keyof typeof form]}
            onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
            className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626]" />
        </div>
      ))}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Skills</label>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map(s => (
            <button key={s} type="button" onClick={() => toggleSkill(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedSkills.includes(s)
                  ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Availability</label>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABILITY.map(a => (
            <button key={a} type="button" onClick={() => toggleAvail(a)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedAvailability.includes(a)
                  ? "border-[#DC2626] bg-[#DC2626]/5 text-[#DC2626]"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Message (optional)</label>
        <textarea value={form.availability_notes} onChange={e => set("availability_notes", e.target.value)} rows={2}
          placeholder="Tell us about your motivation or any specific seva you'd like to do..."
          className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#DC2626] resize-none" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

      <button type="submit" disabled={loading || !form.name || !form.phone}
        className="w-full bg-[#DC2626] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#B91C1C] transition-colors disabled:opacity-60">
        {loading ? "Submitting…" : "Register as Volunteer"}
      </button>
    </form>
  )
}
