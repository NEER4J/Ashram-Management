import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Flame, ArrowRight, CalendarBlank, Clock } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export default async function MyPujasPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: bookings } = await supabase
    .from("puja_bookings")
    .select("id, booking_code, puja_date, puja_time, status, payment_status, amount_paid, master_pujas(name, base_amount)")
    .eq("user_id", user.id)
    .order("puja_date", { ascending: false })

  const STATUS_STYLES: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Completed: "bg-zinc-50 text-zinc-500 border-zinc-100",
    Cancelled: "bg-red-50 text-red-600 border-red-100",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Puja Bookings</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your sacred ceremony bookings</p>
        </div>
        <Link
          href={`/a/${slug}/pujas`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline"
        >
          Book Again
          <ArrowRight size={14} />
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Flame size={26} weight="fill" className="text-red-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">No puja bookings yet</p>
          <p className="text-sm text-zinc-400 mb-6">Book a sacred puja performed by our priests</p>
          <Link
            href={`/a/${slug}/pujas`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Browse Pujas
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const puja = Array.isArray(b.master_pujas) ? b.master_pujas[0] : b.master_pujas
            const statusStyle = STATUS_STYLES[b.status] || "bg-zinc-50 text-zinc-500 border-zinc-100"
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Flame size={18} weight="fill" className="text-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {b.booking_code && (
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                            {b.booking_code}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyle}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="font-semibold text-zinc-950">{puja?.name || "Puja"}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                        <CalendarBlank size={13} className="text-zinc-400" />
                        <span>
                          {new Date(b.puja_date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      {b.puja_time && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                          <Clock size={11} />
                          <span>{String(b.puja_time).slice(0, 5)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {Number(b.amount_paid) > 0 ? (
                      <p className="font-bold text-zinc-950">₹{Number(b.amount_paid).toLocaleString("en-IN")}</p>
                    ) : (
                      <p className="text-sm text-amber-600 font-semibold">Pay at Ashram</p>
                    )}
                    <p className={`text-xs font-semibold mt-0.5 ${b.payment_status === "Paid" ? "text-emerald-600" : "text-amber-600"}`}>
                      {b.payment_status}
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
