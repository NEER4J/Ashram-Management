import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

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
  return { title: data ? `Book a Stay — ${data.ashram_name}` : "Book a Stay" };
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  single: "Single Room",
  double: "Double Room",
  dormitory: "Dormitory",
  family_suite: "Family Suite",
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
    .select("id, name, room_type, bed_count, amenities, base_price_per_night, building")
    .eq("is_active", true)
    .order("base_price_per_night", { ascending: true });

  const checkIn  = ashram.default_checkin_time  ? String(ashram.default_checkin_time).slice(0, 5)  : "14:00";
  const checkOut = ashram.default_checkout_time ? String(ashram.default_checkout_time).slice(0, 5) : "11:00";

  return (
    <>
      {/* Header */}
      <section className="bg-zinc-950 py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="w-8 h-[3px] bg-[#DC2626] mb-5" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Stay & Accommodation</h1>
          <p className="mt-3 text-white/50 max-w-xl">
            Rest and rejuvenate at {ashram.ashram_name}.
          </p>
        </div>
      </section>

      {/* Check-in info bar */}
      <section className="bg-white border-b border-zinc-100 px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-8 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Check-in</span>
            <span className="font-semibold text-zinc-950">{checkIn}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Check-out</span>
            <span className="font-semibold text-zinc-950">{checkOut}</span>
          </div>
          {ashram.address && (
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Location</span>
              <span className="text-zinc-600">{ashram.address}</span>
            </div>
          )}
        </div>
      </section>

      {/* Rooms */}
      <section className="py-16 px-4 sm:px-6 bg-zinc-50">
        <div className="max-w-5xl mx-auto">
          {!rooms || rooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-400 mb-6">Room details are not available online yet.</p>
              {ashram.phone && (
                <a href={`tel:${ashram.phone}`} className="inline-block bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-colors">
                  Call {ashram.phone}
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {rooms.map((room) => {
                  const amenitiesList = room.amenities
                    ? Object.entries(room.amenities as Record<string, boolean>)
                        .filter(([, v]) => v)
                        .map(([k]) => k.replace(/_/g, " "))
                    : [];

                  return (
                    <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Room type color bar */}
                      <div className="h-1.5 bg-[#DC2626]" />
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 block mb-1">
                              {ROOM_TYPE_LABELS[room.room_type] || room.room_type}
                            </span>
                            <h3 className="font-serif text-xl font-bold text-zinc-950">{room.name}</h3>
                          </div>
                          <div className="text-right">
                            {room.base_price_per_night > 0 ? (
                              <>
                                <div className="font-serif text-xl font-bold text-zinc-950">
                                  ₹{Number(room.base_price_per_night).toLocaleString("en-IN")}
                                </div>
                                <div className="text-[10px] text-zinc-400">/night</div>
                              </>
                            ) : (
                              <div className="font-bold text-emerald-600 text-sm">Free</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                          <span>🛏 {room.bed_count} bed{room.bed_count !== 1 ? "s" : ""}</span>
                          {room.building && <span>🏢 {room.building}</span>}
                        </div>

                        {amenitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {amenitiesList.slice(0, 5).map((a) => (
                              <span key={a} className="text-[10px] font-medium capitalize px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Booking CTA */}
              <div className="bg-zinc-950 rounded-2xl p-8 md:p-10 text-center">
                <h3 className="font-serif text-2xl font-bold text-white mb-2">Ready to book?</h3>
                <p className="text-white/50 text-sm mb-6">Contact us to check availability and confirm your dates.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {ashram.phone && (
                    <a href={`tel:${ashram.phone}`} className="bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-colors">
                      Call {ashram.phone}
                    </a>
                  )}
                  {ashram.email && (
                    <a href={`mailto:${ashram.email}?subject=Accommodation Enquiry`} className="border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-full hover:border-white/50 transition-colors">
                      Email Us
                    </a>
                  )}
                </div>
                {ashram.booking_confirmation_msg && (
                  <p className="text-xs text-white/30 mt-6 max-w-sm mx-auto">{ashram.booking_confirmation_msg}</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
