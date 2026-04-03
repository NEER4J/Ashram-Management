import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Bed, Buildings, ArrowRight, Clock, CurrencyInr, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ashram_settings")
    .select("ashram_name")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();
  return { title: data ? `Stay — ${data.ashram_name}` : "Stay" };
}

const ROOM_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; gradient: string }> = {
  single:       { label: "Single Room",  color: "text-blue-600",    bg: "bg-blue-50",    gradient: "linear-gradient(to right, #60a5fa, #93c5fd)" },
  double:       { label: "Double Room",  color: "text-violet-600",  bg: "bg-violet-50",  gradient: "linear-gradient(to right, #a78bfa, #c4b5fd)" },
  dormitory:    { label: "Dormitory",    color: "text-amber-600",   bg: "bg-amber-50",   gradient: "linear-gradient(to right, #fbbf24, #fcd34d)" },
  family_suite: { label: "Family Suite", color: "text-emerald-600", bg: "bg-emerald-50", gradient: "linear-gradient(to right, #34d399, #6ee7b7)" },
};

export default async function AshramStayPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name, default_checkin_time, default_checkout_time, booking_confirmation_msg, address, phone, email")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!ashram) notFound();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, name, room_type, bed_count, amenities, base_price_per_night, building, image_url")
    .eq("is_active", true)
    .order("base_price_per_night", { ascending: true });

  const checkIn  = ashram.default_checkin_time  ? String(ashram.default_checkin_time).slice(0, 5)  : "14:00";
  const checkOut = ashram.default_checkout_time ? String(ashram.default_checkout_time).slice(0, 5) : "11:00";
  const total = (rooms || []).length;

  // Group rooms by type
  const typeOrder = ["single", "double", "family_suite", "dormitory"];
  const grouped = (rooms || []).reduce<Record<string, typeof rooms>>((acc, r) => {
    const key = r!.room_type || "other";
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(r);
    return acc;
  }, {});
  const types = typeOrder.filter(t => grouped[t] && grouped[t]!.length > 0);
  // Add any types not in typeOrder
  Object.keys(grouped).forEach(t => { if (!types.includes(t)) types.push(t); });

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] pt-16 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto pb-16">
          
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                Stay &<br />Accommodation
              </h1>
              <p className="mt-3 text-white/50 max-w-md">
                Rest and rejuvenate at {ashram.ashram_name}. Simple, peaceful rooms in a spiritual atmosphere.
              </p>
              {/* Check-in times in header */}
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Check-in</span>
                  <span className="text-sm font-semibold text-white/80">{checkIn}</span>
                </div>
                <div className="w-px h-4 bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Check-out</span>
                  <span className="text-sm font-semibold text-white/80">{checkOut}</span>
                </div>
              </div>
            </div>
            {total > 0 && (
              <div className="hidden md:block text-right flex-shrink-0">
                  <div className="font-serif text-6xl font-bold text-white leading-none">{total}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">rooms available</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 bg-gray-100 pb-20 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {!rooms || rooms.length === 0 ? (
            <div className="py-16">
              <div className="max-w-lg mx-auto bg-zinc-950 rounded-3xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Bed size={28} weight="thin" className="text-zinc-400" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-white mb-3">Rooms Coming Soon</h2>
                <p className="text-white/50 text-sm mb-8 leading-relaxed">
                  Room details are not available online yet. Please contact us to enquire about accommodation.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {ashram.phone && (
                    <a
                      href={`tel:${ashram.phone}`}
                      className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-colors"
                    >
                      <Phone size={14} />
                      {ashram.phone}
                    </a>
                  )}
                  {ashram.email && (
                    <a
                      href={`mailto:${ashram.email}?subject=Accommodation Enquiry`}
                      className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-full hover:border-white/50 transition-colors"
                    >
                      <EnvelopeSimple size={14} />
                      Email Us
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-14 pt-4">
              {types.map(type => {
                const cfg = ROOM_TYPE_CONFIG[type] || { label: type.replace(/_/g, " "), color: "text-zinc-600", bg: "bg-zinc-100", gradient: "linear-gradient(to right, #d4d4d8, #a1a1aa)" };
                return (
                  <div key={type}>
                    {/* Type section header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                          <Bed size={13} weight="fill" className={cfg.color} />
                        </div>
                        <p className={`text-[11px] font-bold tracking-[0.2em] uppercase ${cfg.color}`}>
                          {cfg.label}
                        </p>
                      </div>
                      <div className="flex-1 h-px bg-zinc-100" />
                      <span className="text-[10px] font-bold text-zinc-400">
                        {grouped[type]!.length} {grouped[type]!.length === 1 ? "room" : "rooms"}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[type]!.map(room => {
                        const amenitiesList = room!.amenities
                          ? Object.entries(room!.amenities as Record<string, boolean>)
                              .filter(([, v]) => v)
                              .map(([k]) => k.replace(/_/g, " "))
                          : [];

                        return (
                          <Link
                            key={room!.id}
                            href={`/a/${slug}/stay/${room!.id}`}
                            className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all block"
                          >
                            {room!.image_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={room!.image_url}
                                alt={room!.name}
                                className="w-full aspect-video object-cover"
                              />
                            )}

                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0 pr-3">
                                  <h3 className="font-serif text-lg font-bold text-zinc-950 leading-tight group-hover:text-[#DC2626] transition-colors">
                                    {room!.name}
                                  </h3>
                                  {room!.building && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Buildings size={11} className="text-zinc-400" />
                                      <span className="text-xs text-zinc-400">{room!.building}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {Number(room!.base_price_per_night) === 0 ? (
                                    <span className="text-sm font-bold text-emerald-600">Free</span>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-0.5 justify-end">
                                        <CurrencyInr size={14} weight="bold" className="text-zinc-700" />
                                        <span className="font-bold text-zinc-950 text-base">
                                          {Number(room!.base_price_per_night).toLocaleString("en-IN")}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-zinc-400">/night</div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 mb-4 text-xs text-zinc-500">
                                <Bed size={13} className="text-zinc-400" />
                                <span>{room!.bed_count} bed{room!.bed_count !== 1 ? "s" : ""}</span>
                              </div>

                              {amenitiesList.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {amenitiesList.slice(0, 4).map((a) => (
                                    <span key={a} className="text-[10px] font-medium capitalize px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">
                                      {a}
                                    </span>
                                  ))}
                                  {amenitiesList.length > 4 && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-100 text-zinc-400 rounded-full">
                                      +{amenitiesList.length - 4} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                                <span className="text-[11px] font-semibold text-zinc-400">View & Book</span>
                                <ArrowRight size={14} className="text-zinc-300 group-hover:text-[#DC2626] transition-colors" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Booking CTA */}
              <div className="bg-zinc-950 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Enquiries</p>
                  <h3 className="font-serif text-xl font-bold text-white">Need help choosing a room?</h3>
                  <p className="text-sm text-white/50 mt-1">Contact us to check availability and confirm your dates.</p>
                  {ashram.booking_confirmation_msg && (
                    <p className="text-xs text-zinc-600 mt-2">{ashram.booking_confirmation_msg}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  {ashram.phone && (
                    <a
                      href={`tel:${ashram.phone}`}
                      className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#B91C1C] transition-colors"
                    >
                      <Phone size={14} />
                      {ashram.phone}
                    </a>
                  )}
                  {ashram.email && (
                    <a
                      href={`mailto:${ashram.email}?subject=Accommodation Enquiry`}
                      className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:border-white/50 hover:bg-white/5 transition-colors"
                    >
                      <EnvelopeSimple size={14} />
                      Email Us
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
