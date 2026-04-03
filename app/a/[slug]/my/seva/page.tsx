import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { HandHeart, ArrowRight, CheckCircle, Clock, X } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

const STATUS_CONFIG = {
  pending:  { label: "Application Pending",  style: "bg-amber-50 text-amber-700 border-amber-100",   Icon: Clock },
  active:   { label: "Active Volunteer",      style: "bg-emerald-50 text-emerald-700 border-emerald-100", Icon: CheckCircle },
  inactive: { label: "Inactive",              style: "bg-zinc-50 text-zinc-500 border-zinc-100",     Icon: X },
} as const

export default async function MySevaPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: volunteer } = await supabase
    .from("volunteers")
    .select("id, status, skills, seva_interest, availability_notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .maybeSingle()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Seva</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your volunteer profile</p>
        </div>
        {volunteer && (
          <Link href={`/a/${slug}/seva`} className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline">
            All Opportunities <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {!volunteer ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <HandHeart size={26} weight="fill" className="text-teal-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">Not registered as a volunteer yet</p>
          <p className="text-sm text-zinc-400 mb-6">Join the ashram&apos;s volunteer community and serve with devotion</p>
          <Link
            href={`/a/${slug}/seva`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Register as Volunteer
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            {(() => {
              const cfg = STATUS_CONFIG[(volunteer.status as keyof typeof STATUS_CONFIG)] || STATUS_CONFIG.pending
              const { Icon } = cfg
              return (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <HandHeart size={22} weight="fill" className="text-teal-500" />
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${cfg.style}`}>
                      <Icon size={11} weight="fill" />
                      {cfg.label}
                    </span>
                    <p className="text-zinc-500 text-sm mt-1.5">
                      Registered {new Date(volunteer.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Skills */}
          {Array.isArray(volunteer.skills) && volunteer.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Skills Offered</p>
              <div className="flex flex-wrap gap-2">
                {(volunteer.skills as string[]).map(skill => (
                  <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Seva interest */}
          {volunteer.seva_interest && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Seva Interest</p>
              <p className="text-sm text-zinc-700">{volunteer.seva_interest}</p>
            </div>
          )}

          {/* Availability notes */}
          {volunteer.availability_notes && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Message / Availability</p>
              <p className="text-sm text-zinc-700 leading-relaxed">{volunteer.availability_notes}</p>
            </div>
          )}

          {volunteer.status === "pending" && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-sm text-amber-800 leading-relaxed">
                Your application is under review. The ashram team will contact you at your registered phone number soon.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
