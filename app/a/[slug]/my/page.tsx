import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Bed, BookOpen, HandHeart, Flame, ArrowRight, CalendarBlank, Hand } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export default async function MyPortalPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { count: bookings },
    { count: enrollments },
    { count: donations },
    { count: pujas },
    { count: events },
    { data: sevaRecord },
  ] = await Promise.all([
    supabase.from("accommodation_bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("course_enrollments").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("donations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("puja_bookings").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("volunteers").select("status").eq("user_id", user.id).maybeSingle(),
  ])

  const statCards = [
    { label: "Stay Bookings",       count: bookings    ?? 0, href: `/a/${slug}/my/bookings`,  Icon: Bed,           cta: "Book a Stay",    ctaHref: `/a/${slug}/stay`,    color: "bg-blue-50 text-blue-600" },
    { label: "Event Registrations", count: events      ?? 0, href: `/a/${slug}/my/events`,    Icon: CalendarBlank, cta: "Browse Events",  ctaHref: `/a/${slug}/events`,  color: "bg-violet-50 text-violet-600" },
    { label: "Enrolled Courses",    count: enrollments ?? 0, href: `/a/${slug}/my/courses`,   Icon: BookOpen,      cta: "Browse Courses", ctaHref: `/a/${slug}/courses`, color: "bg-emerald-50 text-emerald-600" },
    { label: "Donations Made",      count: donations   ?? 0, href: `/a/${slug}/my/donations`, Icon: HandHeart,     cta: "Donate Now",     ctaHref: `/a/${slug}/donate`,  color: "bg-amber-50 text-amber-600" },
    { label: "Puja Bookings",       count: pujas       ?? 0, href: `/a/${slug}/my/pujas`,     Icon: Flame,         cta: "Book a Puja",    ctaHref: `/a/${slug}/pujas`,   color: "bg-red-50 text-red-600" },
  ]

  const sevaStatus = sevaRecord?.status
  const sevaLabel  = sevaStatus === "active" ? "Active" : sevaStatus === "pending" ? "Pending" : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-zinc-950">Overview</h2>
        <p className="text-sm text-zinc-400 mt-0.5">Your activity at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, count, href, Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-zinc-200 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
              <Icon size={20} weight="fill" />
            </div>
            <div className="font-serif text-4xl font-bold text-zinc-950 mb-1">{count}</div>
            <div className="text-xs text-zinc-400 font-medium">{label}</div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-300 group-hover:text-[#DC2626] transition-colors mt-3 font-medium">
              View all <ArrowRight size={10} />
            </div>
          </Link>
        ))}

        {/* Seva card — shows status or invite */}
        <Link
          href={`/a/${slug}/my/seva`}
          className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-zinc-200 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
            <Hand size={20} weight="fill" />
          </div>
          {sevaLabel ? (
            <>
              <div className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-1 ${
                sevaStatus === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {sevaLabel}
              </div>
              <div className="text-xs text-zinc-400 font-medium mt-0.5">Volunteer Status</div>
            </>
          ) : (
            <>
              <div className="font-serif text-2xl font-bold text-zinc-300 mb-1">—</div>
              <div className="text-xs text-zinc-400 font-medium">Seva / Volunteer</div>
            </>
          )}
          <div className="flex items-center gap-1 text-[11px] text-zinc-300 group-hover:text-[#DC2626] transition-colors mt-3 font-medium">
            {sevaLabel ? "View details" : "Register now"} <ArrowRight size={10} />
          </div>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h3 className="font-semibold text-zinc-950 mb-4 text-sm">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {statCards.map(({ cta, ctaHref, Icon, color }) => (
            <Link
              key={ctaHref}
              href={ctaHref}
              className="group flex items-center gap-3 border border-zinc-100 rounded-xl px-4 py-3.5 hover:border-[#DC2626]/30 hover:bg-red-50/30 transition-all"
            >
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} weight="fill" />
              </div>
              <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{cta}</span>
              <ArrowRight size={14} className="ml-auto text-zinc-300 group-hover:text-[#DC2626] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
