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
  return { title: data ? `Courses & Materials — ${data.ashram_name}` : "Courses" };
}

export default async function AshramCoursesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!ashram) notFound();

  const { data: materials } = await supabase
    .from("study_materials")
    .select("id, title, description, type, price, is_free, cover_image_url, author, language")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Group by type
  const grouped = (materials || []).reduce<Record<string, typeof materials>>((acc, m) => {
    const key = m!.type || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(m);
    return acc;
  }, {});

  const typeOrder = ["Course", "Video", "PDF", "Book", "Audio", "Other"];
  const types = typeOrder.filter((t) => grouped[t] && grouped[t]!.length > 0);

  return (
    <>
      {/* Header */}
      <section className="bg-zinc-950 py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="w-8 h-[3px] bg-[#DC2626] mb-5" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Courses & Study Materials</h1>
          <p className="mt-3 text-white/50 max-w-xl">
            Books, videos, courses, and resources from {ashram.ashram_name}.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          {!materials || materials.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              No materials available yet. Check back soon.
            </div>
          ) : (
            <div className="space-y-14">
              {types.map((type) => (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-6">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#DC2626]">{type}s</p>
                    <div className="flex-1 h-px bg-zinc-100" />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {grouped[type]!.map((m) => (
                      <div key={m!.id} className="group bg-zinc-50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        {m!.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m!.cover_image_url} alt={m!.title} className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center text-4xl">
                            {type === "Course" ? "🎓" : type === "Video" ? "🎬" : type === "PDF" ? "📄" : type === "Book" ? "📚" : type === "Audio" ? "🎧" : "📁"}
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-serif text-base font-bold text-zinc-950 leading-snug mb-1">
                            {m!.title}
                          </h3>
                          {m!.author && <p className="text-xs text-zinc-400 mb-2">by {m!.author}</p>}
                          {m!.description && (
                            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">{m!.description}</p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                            {m!.is_free || m!.price === 0 ? (
                              <span className="text-sm font-bold text-emerald-600">Free</span>
                            ) : (
                              <span className="text-sm font-bold text-zinc-950">
                                ₹{Number(m!.price).toLocaleString("en-IN")}
                              </span>
                            )}
                            {m!.language && m!.language !== "English" && (
                              <span className="text-xs text-zinc-400">{m!.language}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
