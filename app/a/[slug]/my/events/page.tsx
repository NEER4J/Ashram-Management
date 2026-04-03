import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CalendarBlank, ArrowRight } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

const STATUS_STYLES: Record<string, string> = {
  Registered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Attended:   "bg-blue-50 text-blue-700 border-blue-100",
  Cancelled:  "bg-red-50 text-red-600 border-red-100",
  Pending:    "bg-amber-50 text-amber-700 border-amber-100",
}

export default async function MyEventsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("id, status, payment_status, payment_mode, fee_paid, created_at, temple_events(id, name, start_date, type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Events</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your event registrations</p>
        </div>
        <Link
          href={`/a/${slug}/events`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline"
        >
          Browse Events
          <ArrowRight size={14} />
        </Link>
      </div>

      {!registrations || registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <CalendarBlank size={26} weight="fill" className="text-violet-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">No event registrations yet</p>
          <p className="text-sm text-zinc-400 mb-6">Register for upcoming festivals and events</p>
          <Link
            href={`/a/${slug}/events`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map(r => {
            const event      = Array.isArray(r.temple_events) ? r.temple_events[0] : r.temple_events
            const statusStyle = STATUS_STYLES[r.status] || "bg-zinc-50 text-zinc-500 border-zinc-100"
            const startDate  = event?.start_date ? new Date(event.start_date) : null
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CalendarBlank size={18} weight="fill" className="text-violet-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyle}`}>
                          {r.status}
                        </span>
                        {event?.type && (
                          <span className="text-[10px] font-bold uppercase text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                            {event.type}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-zinc-950">
                        {event ? (
                          <Link href={`/a/${slug}/events/${event.id}`} className="hover:text-[#DC2626] transition-colors">
                            {event.name}
                          </Link>
                        ) : "Event"}
                      </p>
                      {startDate && (
                        <p className="text-sm text-zinc-500 mt-1">
                          {startDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Registered {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {Number(r.fee_paid) > 0 ? (
                      <p className="font-bold text-zinc-950">₹{Number(r.fee_paid).toLocaleString("en-IN")}</p>
                    ) : (
                      <p className="text-sm font-semibold text-emerald-600">Free</p>
                    )}
                    <p className={`text-xs font-semibold mt-0.5 ${
                      r.payment_status === "paid" ? "text-emerald-600" :
                      r.payment_status === "free" ? "text-zinc-400" : "text-amber-600"
                    }`}>
                      {r.payment_status === "paid" ? "Paid" :
                       r.payment_status === "free" ? "Free" : "Pay at Ashram"}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
