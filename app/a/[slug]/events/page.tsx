import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { MapPin, ArrowRight, CalendarBlank } from "@phosphor-icons/react/dist/ssr";

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
  return { title: data ? `Events — ${data.ashram_name}` : "Events" };
}

export default async function AshramEventsPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!ashram) notFound();

  const today = new Date().toISOString().split("T")[0];

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("temple_events")
      .select("id, name, description, start_date, end_date, city, state, hero_image_url, type")
      .eq("is_published", true)
      .gte("start_date", today)
      .order("start_date", { ascending: true }),
    supabase
      .from("temple_events")
      .select("id, name, start_date, city, state, type")
      .eq("is_published", true)
      .lt("start_date", today)
      .order("start_date", { ascending: false })
      .limit(6),
  ]);

  const withImages = (upcoming || []).filter(e => e.hero_image_url);
  const withoutImages = (upcoming || []).filter(e => !e.hero_image_url);

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] pt-16 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto pb-16">
          
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                Events &<br />Festivals
              </h1>
              <p className="mt-3 text-white/50 max-w-md">
                All upcoming programmes, yajnas, and festivals at {ashram.ashram_name}.
              </p>
            </div>
            {upcoming && upcoming.length > 0 && (
              <div className="hidden md:block text-right flex-shrink-0">
                <div className="font-serif text-6xl font-bold text-white leading-none">{upcoming.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">upcoming</div>
              </div>
            )}
          </div>
        </div>
        {/* Bottom edge divider */}
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 bg-gray-100 pb-20 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {!upcoming || upcoming.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <CalendarBlank size={28} weight="thin" className="text-zinc-400" />
              </div>
              <p className="text-zinc-400 font-medium">No upcoming events scheduled.</p>
              <p className="text-sm text-zinc-300 mt-1">Check back soon.</p>
            </div>
          ) : (
            <>
              {/* Featured — with images */}
              {withImages.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  {withImages.map((event, i) => {
                    const date = new Date(event.start_date);
                    const location = [event.city, event.state].filter(Boolean).join(", ");
                    return (
                      <Link
                        key={event.id}
                        href={`/a/${slug}/events/${event.id}`}
                        className={`group relative overflow-hidden rounded-3xl block ${i === 0 && withImages.length > 2 ? "sm:col-span-2 aspect-[21/9]" : "aspect-[4/3]"}`}
                      >
                        <Image
                          src={event.hero_image_url!}
                          alt={event.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                        {/* Date badge */}
                        <div className="absolute top-5 left-5">
                          <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center min-w-[56px]">
                            <div className="font-serif text-2xl font-bold text-white leading-none">{date.toLocaleDateString("en-IN", { day: "numeric" })}</div>
                            <div className="text-[9px] font-bold uppercase text-[#DC2626] mt-0.5">{date.toLocaleDateString("en-IN", { month: "short" })}</div>
                            <div className="text-[9px] text-white/40">{date.getFullYear()}</div>
                          </div>
                        </div>

                        {event.type && (
                          <div className="absolute top-5 right-5">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-white/70 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                              {event.type}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-snug mb-1">
                            {event.name}
                          </h2>
                          {location && (
                            <div className="flex items-center gap-1.5 text-sm text-white/60">
                              <MapPin size={13} />
                              <span>{location}</span>
                            </div>
                          )}
                          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-white/25 transition-colors">
                            View Details <ArrowRight size={12} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Text events — without images */}
              {withoutImages.length > 0 && (
                <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden">
                  {withoutImages.map((event) => {
                    const start = new Date(event.start_date);
                    const end = event.end_date ? new Date(event.end_date) : null;
                    const location = [event.city, event.state].filter(Boolean).join(", ");
                    return (
                      <Link
                        key={event.id}
                        href={`/a/${slug}/events/${event.id}`}
                        className="group grid grid-cols-[auto_1fr_auto] gap-5 md:gap-8 items-center py-5 px-6 hover:bg-zinc-50 transition-colors bg-white rounded-2xl"
                      >
                        {/* Date block */}
                        <div className="w-14 text-center bg-zinc-950 rounded-xl py-3 flex-shrink-0">
                          <div className="font-serif text-2xl font-bold text-white leading-none">
                            {start.toLocaleDateString("en-IN", { day: "numeric" })}
                          </div>
                          <div className="text-[9px] font-bold uppercase text-[#DC2626] mt-1">
                            {start.toLocaleDateString("en-IN", { month: "short" })}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="min-w-0">
                          {event.type && (
                            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{event.type}</span>
                          )}
                          <h2 className="font-serif text-lg font-bold text-zinc-950 group-hover:text-[#DC2626] transition-colors leading-snug truncate">
                            {event.name}
                          </h2>
                          <div className="flex flex-wrap gap-3 text-xs text-zinc-400 mt-1">
                            {location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {location}
                              </span>
                            )}
                            {end && (
                              <span>Until {end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                            )}
                          </div>
                        </div>

                        <ArrowRight size={16} className="text-zinc-300 group-hover:text-[#DC2626] transition-colors flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Past events */}
          {past && past.length > 0 && (
            <div className="mt-16">
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-6">Past Events</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {past.map((event) => (
                  <div key={event.id} className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl">
                    <p className="text-xs text-zinc-400 mb-1">
                      {new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h3 className="text-sm font-semibold text-zinc-600">{event.name}</h3>
                    {(event.city || event.state) && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                        <MapPin size={10} />
                        <span>{[event.city, event.state].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
