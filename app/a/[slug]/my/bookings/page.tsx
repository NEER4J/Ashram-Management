import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Bed, ArrowRight, CalendarBlank, Users } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export default async function MyBookingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: bookings } = await supabase
    .from("accommodation_bookings")
    .select("id, booking_code, check_in_date, check_out_date, status, number_of_guests, total_amount, payment_status, payment_mode, rooms(name, room_type)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const STATUS_STYLES: Record<string, string> = {
    Pending:    "bg-amber-50 text-amber-700 border-amber-100",
    Confirmed:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    CheckedIn:  "bg-blue-50 text-blue-700 border-blue-100",
    CheckedOut: "bg-zinc-50 text-zinc-500 border-zinc-100",
    Cancelled:  "bg-red-50 text-red-600 border-red-100",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Bookings</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your stay reservations</p>
        </div>
        <Link
          href={`/a/${slug}/stay`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline"
        >
          Book a Stay
          <ArrowRight size={14} />
        </Link>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Bed size={26} weight="fill" className="text-blue-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">No bookings yet</p>
          <p className="text-sm text-zinc-400 mb-6">Book a peaceful stay at the ashram</p>
          <Link
            href={`/a/${slug}/stay`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const room = Array.isArray(b.rooms) ? b.rooms[0] : b.rooms
            const statusStyle = STATUS_STYLES[b.status] || "bg-zinc-50 text-zinc-500 border-zinc-100"
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bed size={18} weight="fill" className="text-blue-500" />
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
                      <p className="font-semibold text-zinc-950">{room?.name || "Room"}</p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                        <CalendarBlank size={13} className="text-zinc-400" />
                        <span>{new Date(b.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="text-zinc-300">—</span>
                        <span>{new Date(b.check_out_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                        <Users size={11} />
                        <span>{b.number_of_guests} guest{b.number_of_guests !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {Number(b.total_amount) > 0 && (
                      <p className="font-bold text-zinc-950">₹{Number(b.total_amount).toLocaleString("en-IN")}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-0.5 capitalize">{b.payment_mode?.replace(/_/g, " ") || "—"}</p>
                    <p className={`text-xs font-semibold mt-0.5 ${b.payment_status === "Completed" ? "text-emerald-600" : "text-amber-600"}`}>
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
