import Image from "next/image";
import Link from "next/link";
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
    .select("ashram_name, ashram_tagline, seo_description")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!data) return {};
  return {
    title: data.ashram_name,
    description: data.seo_description || data.ashram_tagline || undefined,
  };
}

export default async function AshramPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name, ashram_tagline, cover_image_url, about_text, address, phone, email, logo_url")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!ashram) notFound();

  // Fetch data for all three sections in parallel
  const [{ data: events }, { data: materials }, { data: rooms }] = await Promise.all([
    supabase
      .from("temple_events")
      .select("id, name, start_date, end_date, city, state, hero_image_url, type")
      .eq("is_published", true)
      .eq("is_active", true)
      .gte("start_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(3),
    supabase
      .from("study_materials")
      .select("id, title, description, type, price, is_free, cover_image_url, author")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("rooms")
      .select("id, name, room_type, bed_count, base_price_per_night, amenities")
      .eq("is_active", true)
      .order("base_price_per_night", { ascending: true })
      .limit(3),
  ]);

  const coverImage =
    ashram.cover_image_url ||
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1800&q=85";

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden">
        <Image src={coverImage} alt={ashram.ashram_name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, transparent 30%, rgba(0,0,0,0.35) 100%)" }} />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
          {ashram.logo_url && (
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ashram.logo_url} alt={ashram.ashram_name} className="h-16 w-16 object-contain rounded-full bg-white/10 backdrop-blur-sm p-1" />
            </div>
          )}
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/60 mb-5">Welcome</p>
          <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl font-bold text-white leading-[1.0] mb-6 drop-shadow-lg">
            {ashram.ashram_name}
          </h1>
          {ashram.ashram_tagline && (
            <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10">
              {ashram.ashram_tagline}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={`/a/${slug}/stay`} className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#B91C1C] transition-colors shadow-lg">
              Book a Stay
            </Link>
            <Link href={`/a/${slug}/events`} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-7 py-3.5 rounded-full border border-white/30 hover:bg-white/25 transition-colors">
              View Events
            </Link>
            {materials && materials.length > 0 && (
              <Link href={`/a/${slug}/courses`} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-semibold px-7 py-3.5 rounded-full border border-white/30 hover:bg-white/25 transition-colors">
                Courses
              </Link>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      {ashram.about_text && (
        <section className="py-24 md:py-32 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[1fr_3fr] gap-12 items-start">
              <div>
                <div className="w-10 h-[3px] bg-[#DC2626] mb-5" />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">About the Ashram</p>
              </div>
              <p className="font-serif text-3xl md:text-4xl text-zinc-900 leading-relaxed font-normal">
                {ashram.about_text}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── THREE CATEGORY CARDS ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="w-8 h-[3px] bg-[#DC2626] mx-auto mb-4" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Explore</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">

            {/* ── Events card ── */}
            <Link href={`/a/${slug}/events`} className="group relative overflow-hidden rounded-3xl aspect-[3/4] block">
              <Image
                src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=700&q=85"
                alt="Events"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                  {events && events.length > 0 ? `${events.length}+ upcoming` : "Explore"}
                </span>
                <div>
                  <h3 className="font-serif text-3xl font-bold text-white mb-3 leading-tight">
                    Events &<br />Festivals
                  </h3>
                  {events && events.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {events.slice(0, 2).map((e) => (
                        <div key={e.id} className="flex items-center gap-3">
                          <span className="text-[#DC2626] font-bold text-xs font-mono">
                            {new Date(e.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="text-white/80 text-xs truncate">{e.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm mb-5">View all programmes and festivals</p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-white/25 transition-colors">
                    View Events →
                  </span>
                </div>
              </div>
            </Link>

            {/* ── Courses card ── */}
            <Link href={`/a/${slug}/courses`} className="group relative overflow-hidden rounded-3xl aspect-[3/4] block">
              <Image
                src="https://images.unsplash.com/photo-1529448005898-c2ea297e0bcd?w=700&q=85"
                alt="Courses"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                  {materials && materials.length > 0 ? `${materials.length}+ available` : "Learning"}
                </span>
                <div>
                  <h3 className="font-serif text-3xl font-bold text-white mb-3 leading-tight">
                    Courses &<br />Study Materials
                  </h3>
                  {materials && materials.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {materials.slice(0, 2).map((m) => (
                        <div key={m.id} className="flex items-center gap-3">
                          <span className="text-[#DC2626] font-bold text-xs uppercase">{m.type}</span>
                          <span className="text-white/80 text-xs truncate">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm mb-5">Books, videos, and online courses</p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-white/25 transition-colors">
                    Browse Courses →
                  </span>
                </div>
              </div>
            </Link>

            {/* ── Stay card ── */}
            <Link href={`/a/${slug}/stay`} className="group relative overflow-hidden rounded-3xl aspect-[3/4] block">
              <Image
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=85"
                alt="Stay"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                  {rooms && rooms.length > 0 ? `${rooms.length} room types` : "Accommodation"}
                </span>
                <div>
                  <h3 className="font-serif text-3xl font-bold text-white mb-3 leading-tight">
                    Stay &<br />Accommodation
                  </h3>
                  {rooms && rooms.length > 0 ? (
                    <div className="space-y-2 mb-5">
                      {rooms.slice(0, 2).map((r) => (
                        <div key={r.id} className="flex items-center gap-3">
                          <span className="text-[#DC2626] font-bold text-xs capitalize">{r.room_type.replace("_", " ")}</span>
                          <span className="text-white/80 text-xs">
                            {r.base_price_per_night > 0 ? `₹${Number(r.base_price_per_night).toLocaleString("en-IN")}/night` : "Free"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm mb-5">Peaceful rooms for spiritual retreat</p>
                  )}
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#DC2626] px-4 py-2 rounded-full group-hover:bg-[#B91C1C] transition-colors">
                    Book a Stay →
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS LIST ─────────────────────────────────────────────── */}
      {events && events.length > 0 && (
        <section className="py-20 px-4 sm:px-6 bg-white border-t border-zinc-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="w-8 h-[3px] bg-[#DC2626] mb-4" />
                <h2 className="font-serif text-4xl font-bold text-zinc-950">Upcoming Events</h2>
              </div>
              <Link href={`/a/${slug}/events`} className="hidden sm:inline-flex text-sm font-medium text-zinc-400 hover:text-zinc-950 transition-colors pb-1 border-b border-zinc-200 hover:border-zinc-950">
                All events →
              </Link>
            </div>
            <div className="divide-y divide-zinc-100">
              {events.map((event, i) => {
                const date = new Date(event.start_date);
                const location = [event.city, event.state].filter(Boolean).join(", ");
                return (
                  <div key={event.id} className="group flex items-center gap-6 py-5">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="font-serif text-2xl font-bold text-zinc-950 leading-none">
                        {date.toLocaleDateString("en-IN", { day: "numeric" })}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-[#DC2626] mt-0.5">
                        {date.toLocaleDateString("en-IN", { month: "short" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-bold text-zinc-950 leading-snug truncate">{event.name}</h3>
                      {location && <p className="text-sm text-zinc-400 mt-0.5">{location}</p>}
                    </div>
                    {event.type && (
                      <span className="hidden sm:block text-[10px] font-bold tracking-wider uppercase text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full">
                        {event.type}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── VISIT / CONTACT ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#DC2626] py-24 md:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/60 mb-4">Plan Your Visit</p>
              <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Come, find<br />your peace.
              </h2>
              <Link href={`/a/${slug}/stay`} className="inline-flex items-center gap-2 bg-white text-[#DC2626] text-sm font-bold px-7 py-3.5 rounded-full hover:bg-zinc-100 transition-colors">
                Book Accommodation →
              </Link>
            </div>
            <div className="space-y-4">
              {ashram.address && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-white/50 mb-2">Address</p>
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">{ashram.address}</p>
                </div>
              )}
              {(ashram.phone || ashram.email) && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-1.5">
                  <p className="text-[10px] font-bold tracking-wider uppercase text-white/50 mb-2">Contact</p>
                  {ashram.phone && <a href={`tel:${ashram.phone}`} className="block text-white/90 text-sm hover:text-white">{ashram.phone}</a>}
                  {ashram.email && <a href={`mailto:${ashram.email}`} className="block text-white/90 text-sm hover:text-white">{ashram.email}</a>}
                </div>
              )}
              {!ashram.address && !ashram.phone && !ashram.email && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <p className="text-white/60 text-sm">Update your contact details in Dashboard → Settings → General.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
