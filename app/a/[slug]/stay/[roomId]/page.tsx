import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { BookingForm } from "@/components/public/booking-form"
import { Bed, Snowflake, Fan, Shower, Plant, Television, WifiHigh, Lock, Student, ArrowLeft } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string; roomId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roomId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("rooms").select("name").eq("id", roomId).single()
  return { title: data?.name || "Room" }
}

const ROOM_LABELS: Record<string, string> = {
  single: "Single Room", double: "Double Room", dormitory: "Dormitory", family_suite: "Family Suite",
}

type PhosphorIcon = typeof Bed
const AMENITY_ICONS: Record<string, PhosphorIcon> = {
  ac: Snowflake,
  fan: Fan,
  attached_bathroom: Shower,
  balcony: Plant,
  tv: Television,
  wifi: WifiHigh,
  geyser: Shower,
  locker: Lock,
  study_table: Student,
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug, roomId } = await params
  const supabase = await createClient()

  const [{ data: room }, { data: ashram }, { data: { user } }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, name, room_type, bed_count, amenities, building, base_price_per_night, image_url, description")
      .eq("id", roomId)
      .eq("is_active", true)
      .single(),
    supabase
      .from("ashram_settings")
      .select("ashram_name, default_checkin_time, default_checkout_time, booking_confirmation_msg, phone, email")
      .eq("public_slug", slug)
      .eq("is_public", true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!room || !ashram) notFound()

  const amenitiesList = room.amenities
    ? Object.entries(room.amenities as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k)
    : []

  const checkIn  = ashram.default_checkin_time  ? String(ashram.default_checkin_time).slice(0, 5)  : "14:00"
  const checkOut = ashram.default_checkout_time ? String(ashram.default_checkout_time).slice(0, 5) : "11:00"
  const isFree = Number(room.base_price_per_night) === 0

  return (
    <>
      {/* Hero image */}
      {room.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="w-full aspect-[3/1] overflow-hidden bg-zinc-900">
          <img src={room.image_url} alt={room.name} className="w-full h-full object-cover aspect-square opacity-80" />
        </div>
      )}

      {/* Header */}
      <section className={`px-4 sm:px-6 ${room.image_url ? "bg-zinc-950 py-10" : "bg-zinc-950 py-14"}`}>
        <div className="max-w-5xl mx-auto">
          <Link href={`/a/${slug}/stay`} className="inline-flex items-center gap-1.5 text-white/50 text-xs font-medium mb-6 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            All Rooms
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/50 bg-white/10 px-3 py-1 rounded-full">
              {ROOM_LABELS[room.room_type] || room.room_type}
            </span>
            {room.building && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-white/50 bg-white/10 px-3 py-1 rounded-full">
                {room.building}
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-2">{room.name}</h1>
          <div className="flex items-center gap-4 text-white/50 text-sm mt-3">
            <span className="flex items-center gap-1.5"><Bed size={15} className="text-white/40" />{room.bed_count} bed{room.bed_count !== 1 ? "s" : ""}</span>
            {isFree ? (
              <span className="text-emerald-400 font-semibold">Free</span>
            ) : (
              <span>₹{Number(room.base_price_per_night).toLocaleString("en-IN")} / night</span>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-4 sm:px-6 bg-gray-100 min-h-[calc(100vh-300px)]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10">

          {/* Left: details */}
          <div>
            {/* Policies */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-zinc-100">
              <div className="bg-zinc-50 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Check-in</p>
                <p className="text-2xl font-bold text-zinc-950">{checkIn}</p>
              </div>
              <div className="bg-zinc-50 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Check-out</p>
                <p className="text-2xl font-bold text-zinc-950">{checkOut}</p>
              </div>
            </div>

            {room.description && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-3">About this Room</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{room.description}</p>
              </div>
            )}

            {amenitiesList.length > 0 && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {amenitiesList.map(a => {
                    const Icon = AMENITY_ICONS[a] || Bed
                    return (
                      <div key={a} className="flex items-center gap-2.5 bg-zinc-50 rounded-xl px-4 py-3">
                        <Icon size={16} weight="regular" className="text-zinc-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-zinc-700 capitalize">{a.replace(/_/g, " ")}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {ashram.booking_confirmation_msg && (
              <div className="bg-amber-50 rounded-2xl p-5 text-sm text-amber-800 border border-amber-100">
                {ashram.booking_confirmation_msg}
              </div>
            )}
          </div>

          {/* Right: booking form */}
          <div>
            <div className="bg-white rounded-3xl p-6 sticky top-[80px] shadow-sm">
              
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1">
                {isFree ? "Book This Room" : `₹${Number(room.base_price_per_night).toLocaleString("en-IN")} / night`}
              </h3>
              <p className="text-sm text-zinc-400 mb-5">
                {isFree ? "Complimentary accommodation" : "Subject to availability"}
              </p>
              <BookingForm
                roomId={roomId}
                slug={slug}
                pricePerNight={isFree ? 0 : Number(room.base_price_per_night)}
                roomName={room.name}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
