import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import {
  MapPinIcon, PhoneIcon, EnvelopeIcon, ArrowRightIcon,
  CalendarBlankIcon, FlameIcon, BookOpenIcon, HandHeartIcon, BedIcon, CurrencyInrIcon,
} from "@phosphor-icons/react/dist/ssr";

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

const CATEGORIES = (slug: string) => [
  {
    label: "Events & Festivals",
    sub:   "Attend spiritual gatherings",
    href:  `/a/${slug}/events`,
    Icon:  CalendarBlankIcon,
    gradient: "from-amber-950 to-amber-800",
    accent:   "bg-amber-400/20",
    icon:     "text-amber-300",
  },
  {
    label: "Pujas & Rituals",
    sub:   "Book a sacred puja",
    href:  `/a/${slug}/pujas`,
    Icon:  FlameIcon,
    gradient: "from-red-950 to-red-800",
    accent:   "bg-red-400/20",
    icon:     "text-red-300",
  },
  {
    label: "Courses",
    sub:   "Study sacred texts & teachings",
    href:  `/a/${slug}/courses`,
    Icon:  BookOpenIcon,
    gradient: "from-indigo-950 to-indigo-800",
    accent:   "bg-indigo-400/20",
    icon:     "text-indigo-300",
  },
  {
    label: "Seva & Volunteering",
    sub:   "Serve with devotion",
    href:  `/a/${slug}/seva`,
    Icon:  HandHeartIcon,
    gradient: "from-teal-950 to-teal-800",
    accent:   "bg-teal-400/20",
    icon:     "text-teal-300",
  },
  {
    label: "Stay & Accommodation",
    sub:   "Peaceful rooms in a spiritual setting",
    href:  `/a/${slug}/stay`,
    Icon:  BedIcon,
    gradient: "from-zinc-900 to-zinc-700",
    accent:   "bg-white/10",
    icon:     "text-zinc-300",
  },
  {
    label: "Donate",
    sub:   "Support the ashram's mission",
    href:  `/a/${slug}/donate`,
    Icon:  CurrencyInrIcon,
    gradient: "from-rose-950 to-rose-800",
    accent:   "bg-rose-400/20",
    icon:     "text-rose-300",
  },
];

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

  const today = new Date().toISOString().split("T")[0];

  const [{ data: events }, { data: materials }, { data: pujas }, { data: rooms }] = await Promise.all([
    supabase
      .from("temple_events")
      .select("id, name, start_date, city, state, hero_image_url, type")
      .eq("is_published", true)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(3),
    supabase
      .from("study_materials")
      .select("id, title, type, price, is_free, cover_image_url, author")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("master_pujas")
      .select("id, name, type, base_amount, duration_minutes")
      .eq("is_active", true)
      .order("type")
      .order("name")
      .limit(4),
    supabase
      .from("rooms")
      .select("id, name, room_type, bed_count, base_price_per_night")
      .eq("is_active", true)
      .order("base_price_per_night", { ascending: true })
      .limit(4),
  ]);

  const coverImage =
    ashram.cover_image_url ||
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1800&q=85";

  return (
    <>
      {/* ── HERO ── left-anchored, bottom-heavy, 72vh */}
      <section className="relative min-h-[480px] flex flex-col justify-end overflow-hidden">
        <Image src={coverImage} alt={ashram.ashram_name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/0" />

        <div className="relative z-10 px-4 sm:px-6 pb-12 max-w-5xl mx-auto w-full">
          {ashram.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ashram.logo_url}
              alt={ashram.ashram_name}
              className="h-12 w-12 object-contain rounded-full bg-white/10 backdrop-blur-sm p-1 mb-5"
            />
          )}
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 mb-3">Welcome to</p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-4">
            {ashram.ashram_name}
          </h1>
          {ashram.ashram_tagline && (
            <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-xl mb-8">
              {ashram.ashram_tagline}
            </p>
          )}
         
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-white py-14 px-4 sm:px-6 overflow-x-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-4xl font-bold text-zinc-950">Explore</h2>
              <p className="text-sm text-zinc-400 mt-1">Everything we have to offer</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES(slug).map(({ label, sub, href, Icon, gradient, accent, icon }) => (
              <Link
                key={href}
                href={href}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 flex flex-col justify-between min-h-[160px] hover:shadow-xl hover:brightness-110 transition-all duration-200`}
              >
                <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center`}>
                  <Icon size={22} weight="fill" className={icon} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white leading-snug">{label}</h3>
                  <p className="text-[11px] text-white/45 mt-0.5 leading-snug">{sub}</p>
                  <div className="flex items-center gap-1 text-[11px] text-white/35 group-hover:text-white/70 transition-colors mt-2.5 font-semibold">
                    Explore <ArrowRightIcon size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      {ashram.about_text && (
        <section className="py-20 md:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[160px_1fr] gap-12 items-start">
              <div className="md:pt-3">
                <div className="w-10 h-[3px] bg-[#DC2626] mb-5" />
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 leading-relaxed">
                  About the<br />Ashram
                </p>
              </div>
              <p className="font-serif text-3xl md:text-4xl text-zinc-900 leading-relaxed font-normal">
                {ashram.about_text}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING / RECENT ── */}
      <div className="bg-gray-100 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-0 pt-14 pb-2">
          <h2 className="font-serif text-4xl font-bold text-zinc-950">What&apos;s On</h2>
          <p className="text-sm text-zinc-400 mt-1">Upcoming events, courses, pujas & rooms</p>
        </div>

        {/* EVENTS */}
        {events && events.length > 0 && (
          <section className="pt-8 pb-14 px-4 sm:px-6 border-b border-zinc-100">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Upcoming Events</h2>
                <Link href={`/a/${slug}/events`} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-800 transition-colors">
                  All <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => {
                  const date = new Date(event.start_date);
                  const location = [event.city, event.state].filter(Boolean).join(", ");
                  return (
                    <Link key={event.id} href={`/a/${slug}/events/${event.id}`}
                      className="group flex gap-4 p-4 rounded-2xl bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all">
                      <div className="w-12 flex-shrink-0 text-center bg-zinc-950 rounded-xl py-2.5">
                        <div className="font-serif text-xl font-bold text-white leading-none">
                          {date.toLocaleDateString("en-IN", { day: "numeric" })}
                        </div>
                        <div className="text-[9px] font-bold uppercase text-[#DC2626] mt-0.5">
                          {date.toLocaleDateString("en-IN", { month: "short" })}
                        </div>
                      </div>
                      <div className="min-w-0">
                        {event.type && <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{event.type}</span>}
                        <h3 className="font-serif text-sm font-bold text-zinc-950 leading-snug group-hover:text-[#DC2626] transition-colors mt-0.5 line-clamp-2">{event.name}</h3>
                        {location && <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1"><MapPinIcon size={10} />{location}</div>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* COURSES */}
        {materials && materials.length > 0 && (
          <section className="pt-8 pb-14 px-4 sm:px-6 border-b border-zinc-100">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Courses & Materials</h2>
                <Link href={`/a/${slug}/courses`} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-800 transition-colors">
                  All <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {materials.map((m) => (
                  <Link key={m.id} href={`/a/${slug}/courses/${m.id}`}
                    className="group block rounded-2xl bg-white border border-zinc-100 overflow-hidden hover:border-zinc-200 hover:shadow-sm transition-all">
                    {m.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.cover_image_url} alt={m.title} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="w-full aspect-video bg-zinc-100 flex items-center justify-center">
                        <BookOpenIcon size={24} weight="thin" className="text-zinc-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{m.type}</span>
                      <h3 className="text-sm font-semibold text-zinc-950 leading-snug mt-0.5 line-clamp-2 group-hover:text-[#DC2626] transition-colors">{m.title}</h3>
                      {m.author && <p className="text-xs text-zinc-400 mt-0.5">by {m.author}</p>}
                      <p className="text-xs font-semibold text-zinc-700 mt-1.5">
                        {m.is_free || m.price === 0 ? "Free" : `₹${Number(m.price).toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PUJAS */}
        {pujas && pujas.length > 0 && (
          <section className="pt-8 pb-14 px-4 sm:px-6 border-b border-zinc-100">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Puja Booking</h2>
                <Link href={`/a/${slug}/pujas`} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-800 transition-colors">
                  All <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {pujas.map((puja) => (
                  <Link key={puja.id} href={`/a/${slug}/pujas/${puja.id}`}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100 hover:border-[#DC2626]/20 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                      <FlameIcon size={16} weight="fill" className="text-[#DC2626]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-950 leading-snug line-clamp-1 group-hover:text-[#DC2626] transition-colors">{puja.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {Number(puja.base_amount) === 0 ? "Free" : `₹${Number(puja.base_amount).toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* STAY */}
        {rooms && rooms.length > 0 && (
          <section className="pt-8 pb-14 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-zinc-950">Stay & Accommodation</h2>
                <Link href={`/a/${slug}/stay`} className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-800 transition-colors">
                  All <ArrowRightIcon size={13} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {rooms.map((room) => (
                  <Link key={room.id} href={`/a/${slug}/stay/${room.id}`}
                    className="group flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
                      <BedIcon size={16} weight="fill" className="text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-950 leading-snug line-clamp-1 capitalize">{room.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {Number(room.base_price_per_night) === 0 ? "Free" : `₹${Number(room.base_price_per_night).toLocaleString("en-IN")}/night`}
                        {" · "}{room.bed_count} bed{room.bed_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── VISIT / CONTACT ── */}
      <section className="relative overflow-hidden bg-[#3C0212] py-20 md:py-28 px-4 sm:px-6">
        {/* Subtle mandala */}
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.03] pointer-events-none" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="110" stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="70"  stroke="white" strokeWidth="0.5"/>
          <circle cx="200" cy="200" r="30"  stroke="white" strokeWidth="0.5"/>
          <line x1="200" y1="10" x2="200" y2="390" stroke="white" strokeWidth="0.5"/>
          <line x1="10"  y1="200" x2="390" y2="200" stroke="white" strokeWidth="0.5"/>
          <line x1="55"  y1="55"  x2="345" y2="345" stroke="white" strokeWidth="0.5"/>
          <line x1="345" y1="55"  x2="55"  y2="345" stroke="white" strokeWidth="0.5"/>
        </svg>

        <div className="max-w-5xl mx-auto relative grid md:grid-cols-2 gap-14 md:gap-20 items-center">
          {/* Left: CTA */}
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Come, find<br />your peace.
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
              Open your heart to a life of devotion, service, and spiritual growth at {ashram.ashram_name}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/a/${slug}/stay`}
                className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#B91C1C] transition-colors"
              >
                Book Accommodation <ArrowRightIcon size={14} />
              </Link>
              <Link
                href={`/a/${slug}/signup`}
                className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-full hover:border-white/50 hover:bg-white/5 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Right: contact details */}
          <div className="space-y-3">
            {ashram.address && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon size={12} className="text-zinc-500" />
                  <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Address</p>
                </div>
                <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{ashram.address}</p>
              </div>
            )}
            {(ashram.phone || ashram.email) && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5 space-y-2.5">
                <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">Contact</p>
                {ashram.phone && (
                  <a href={`tel:${ashram.phone}`} className="flex items-center gap-2.5 text-white/75 text-sm hover:text-white transition-colors">
                    <PhoneIcon size={13} className="text-zinc-500 flex-shrink-0" />
                    {ashram.phone}
                  </a>
                )}
                {ashram.email && (
                  <a href={`mailto:${ashram.email}`} className="flex items-center gap-2.5 text-white/75 text-sm hover:text-white transition-colors">
                    <EnvelopeIcon size={13} className="text-zinc-500 flex-shrink-0" />
                    {ashram.email}
                  </a>
                )}
              </div>
            )}
            {!ashram.address && !ashram.phone && !ashram.email && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <p className="text-zinc-500 text-sm">
                  Update contact details in Dashboard &rarr; Settings &rarr; General.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
