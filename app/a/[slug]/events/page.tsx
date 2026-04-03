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

  const now = new Date().toISOString();

  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("temple_events")
      .select("id, name, description, start_date, end_date, city, state, hero_image_url, type, registration_open")
      .eq("is_published", true)
      .eq("is_active", true)
      .gte("start_date", now)
      .order("start_date", { ascending: true }),
    supabase
      .from("temple_events")
      .select("id, name, start_date, city, state, type")
      .eq("is_published", true)
      .lt("start_date", now)
      .order("start_date", { ascending: false })
      .limit(6),
  ]);

  return (
    <>
      {/* Header */}
      <section className="bg-zinc-950 py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="w-8 h-[3px] bg-[#DC2626] mb-5" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Events & Festivals</h1>
          <p className="mt-3 text-white/50 max-w-xl">
            All upcoming programmes and festivals at {ashram.ashram_name}.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {!upcoming || upcoming.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              No upcoming events scheduled. Check back soon.
            </div>
          ) : (
            <div className="space-y-px">
              {upcoming.map((event) => {
                const start = new Date(event.start_date);
                const end = event.end_date ? new Date(event.end_date) : null;
                const location = [event.city, event.state].filter(Boolean).join(", ");
                return (
                  <div key={event.id} className="group grid grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-start py-7 border-b border-zinc-100 last:border-0">
                    {/* Date */}
                    <div className="flex-shrink-0 w-16 text-center bg-zinc-50 rounded-2xl py-3 px-2">
                      <div className="font-serif text-3xl font-bold text-zinc-950 leading-none">
                        {start.toLocaleDateString("en-IN", { day: "numeric" })}
                      </div>
                      <div className="text-[10px] font-bold uppercase text-[#DC2626] mt-1">
                        {start.toLocaleDateString("en-IN", { month: "short" })}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{start.getFullYear()}</div>
                    </div>
                    {/* Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {event.type && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                            {event.type}
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-xl font-bold text-zinc-950 mb-1">{event.name}</h2>
                      {event.description && (
                        <p className="text-sm text-zinc-500 leading-relaxed mb-2 line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                        {location && <span>{location}</span>}
                        {end && <span>Until {end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                      </div>
                    </div>
                    {/* CTA */}
                    {(event as any).registration_open && (
                      <div className="flex-shrink-0 pt-1">
                        <span className="inline-block bg-[#DC2626] text-white text-xs font-semibold px-4 py-2 rounded-full">
                          Register
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {past && past.length > 0 && (
        <section className="py-12 px-4 sm:px-6 bg-zinc-50 border-t border-zinc-100">
          <div className="max-w-5xl mx-auto">
            <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-6">Past Events</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {past.map((event) => (
                <div key={event.id} className="bg-white border border-zinc-100 p-4 rounded-xl">
                  <p className="text-xs text-zinc-400 mb-1">
                    {new Date(event.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h3 className="text-sm font-semibold text-zinc-700">{event.name}</h3>
                  {(event.city || event.state) && (
                    <p className="text-xs text-zinc-400 mt-1">{[event.city, event.state].filter(Boolean).join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
