import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { BookOpen, VideoCamera, File, Headphones, GraduationCap, ArrowRight } from "@phosphor-icons/react/dist/ssr";

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

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: typeof BookOpen }> = {
  Course: { label: "Courses",         color: "text-violet-400", bg: "bg-violet-950 border-violet-900", Icon: GraduationCap },
  Video:  { label: "Videos",          color: "text-blue-400",   bg: "bg-blue-950 border-blue-900",     Icon: VideoCamera },
  PDF:    { label: "PDFs & Documents", color: "text-orange-400", bg: "bg-orange-950 border-orange-900", Icon: File },
  Book:   { label: "Books",           color: "text-emerald-400",bg: "bg-emerald-950 border-emerald-900",Icon: BookOpen },
  Audio:  { label: "Audio",           color: "text-pink-400",   bg: "bg-pink-950 border-pink-900",     Icon: Headphones },
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

  const grouped = (materials || []).reduce<Record<string, typeof materials>>((acc, m) => {
    const key = m!.type || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(m);
    return acc;
  }, {});

  const typeOrder = ["Course", "Video", "PDF", "Book", "Audio", "Other"];
  const types = typeOrder.filter((t) => grouped[t] && grouped[t]!.length > 0);
  const total = (materials || []).length;

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] pt-16 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto pb-16">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                Courses &<br />Study Materials
              </h1>
              <p className="mt-3 text-white/50 max-w-md">
                Books, videos, courses, and spiritual resources from {ashram.ashram_name}.
              </p>
            </div>
            {total > 0 && (
              <div className="hidden md:block text-right flex-shrink-0">
                <div className="font-serif text-6xl font-bold text-white leading-none">{total}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">materials</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 bg-gray-100 pb-20 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {!materials || materials.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} weight="thin" className="text-zinc-400" />
              </div>
              <p className="text-zinc-400 font-medium">No materials available yet.</p>
              <p className="text-sm text-zinc-300 mt-1">Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-16 pt-4">
              {types.map((type) => {
                const cfg = TYPE_CONFIG[type] || { label: type + "s", color: "text-zinc-400", bg: "bg-zinc-900 border-zinc-800", Icon: File };
                const { label, color, bg, Icon } = cfg;
                return (
                  <div key={type}>
                    {/* Type section header */}
                    <div className={`w-full items-center gap-3 flex justify-between`}>
                      
                      <h2 className="flex items-center gap-2 font-medium text-4xl"> <Icon weight="fill" className="text-zinc-400" />{label}</h2>
                      <h2 className="font-bold">
                        {grouped[type]!.length} materials
                      </h2>
                    </div>
                    <div className="h-px bg-zinc-100 my-4" />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {grouped[type]!.map((m) => (
                        <Link
                          key={m!.id}
                          href={`/a/${slug}/courses/${m!.id}`}
                          className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 hover:shadow-lg transition-all block"
                        >
                          {m!.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m!.cover_image_url} alt={m!.title} className="w-full aspect-video object-cover" />
                          ) : (
                            <div className={`w-full aspect-video flex items-center justify-center border-b border-zinc-100 ${bg}`}>
                              <Icon size={36} weight="thin" className={color} />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="font-serif text-base font-bold text-zinc-950 leading-snug mb-1 group-hover:text-[#DC2626] transition-colors">
                              {m!.title}
                            </h3>
                            {m!.author && <p className="text-xs text-zinc-400 mb-2">by {m!.author}</p>}
                            {m!.description && (
                              <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">{m!.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                              {m!.is_free || m!.price === 0 ? (
                                <span className="text-sm font-bold text-emerald-600">Free</span>
                              ) : (
                                <span className="text-sm font-bold text-zinc-950">
                                  ₹{Number(m!.price).toLocaleString("en-IN")}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-[#DC2626] font-medium transition-colors">
                                View <ArrowRight size={11} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
