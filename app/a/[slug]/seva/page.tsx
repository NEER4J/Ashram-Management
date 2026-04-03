import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { HandHeart, MapPin, ArrowRight, Users } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("ashram_settings").select("ashram_name").eq("public_slug", slug).eq("is_public", true).single()
  return { title: data ? `Seva — ${data.ashram_name}` : "Seva" }
}

export default async function SevaPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: ashram }, { data: opportunities }] = await Promise.all([
    supabase.from("ashram_settings").select("ashram_name").eq("public_slug", slug).eq("is_public", true).single(),
    supabase.from("seva_opportunities").select("id, name, category, description, location").eq("is_active", true).order("category").order("name"),
  ])

  if (!ashram) notFound()

  const grouped = (opportunities || []).reduce<Record<string, typeof opportunities>>((acc, o) => {
    const key = o!.category || "General"
    if (!acc[key]) acc[key] = []
    acc[key]!.push(o)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort()

  const SEVA_VALUES = [
    { title: "Selfless Service", desc: "Seva purifies the mind and opens the heart to the divine." },
    { title: "Community", desc: "Work alongside devotees who share your values and spiritual path." },
    { title: "Meaningful Impact", desc: "Your time and skills directly support the ashram's sacred mission." },
  ]

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] pt-16 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto pb-16">
          
          <div className="grid md:grid-cols-2 gap-10 items-end">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                Seva &<br />Volunteering
              </h1>
              <p className="mt-4 text-white/50 leading-relaxed">
                Join hands with {ashram.ashram_name}. Seva — selfless service — is one of the highest forms of spiritual practice.
              </p>
            </div>
            <div className="hidden md:grid grid-cols-1 gap-3">
              {SEVA_VALUES.map(v => (
                <div key={v.title} className="bg-white/5 border border-white/8 rounded-xl p-4">
                  <p className="text-xs font-bold text-white/60 mb-0.5">{v.title}</p>
                  <p className="text-xs text-white/35 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 sm:px-6 bg-gray-100 pb-20 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {categories.length === 0 ? (
            /* No specific opportunities — general signup */
            <div className="py-16">
              <div className="max-w-2xl mx-auto">
                <div className="bg-zinc-950 rounded-3xl p-10 md:p-14 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/20 border border-[#DC2626]/30 flex items-center justify-center mx-auto mb-6">
                    <HandHeart size={28} weight="fill" className="text-[#DC2626]" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-white mb-4">Volunteer with Us</h2>
                  <p className="text-white/50 mb-8 leading-relaxed max-w-md mx-auto">
                    We welcome devotees who wish to serve. Whether it&apos;s helping with events, kitchen service, outreach, or maintenance — your seva makes a difference.
                  </p>
                  <Link
                    href={`/a/${slug}/seva/general`}
                    className="inline-flex items-center gap-2 bg-[#DC2626] text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-[#B91C1C] transition-colors"
                  >
                    Register as Volunteer
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-14 pt-4">
              {categories.map(cat => (
                <div key={cat}>
                  {/* Category header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#DC2626]/10 flex items-center justify-center flex-shrink-0">
                      <Users size={15} weight="fill" className="text-[#DC2626]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#DC2626]">{cat}</p>
                    </div>
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[10px] font-bold text-zinc-400">{grouped[cat]!.length} {grouped[cat]!.length === 1 ? "opening" : "openings"}</span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[cat]!.map(opp => (
                      <Link
                        key={opp!.id}
                        href={`/a/${slug}/seva/${opp!.id}`}
                        className="group bg-white border border-zinc-100 rounded-2xl p-6 hover:border-[#DC2626]/20 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                          <HandHeart size={18} weight="fill" className="text-[#DC2626]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-zinc-950 mb-2 group-hover:text-[#DC2626] transition-colors leading-snug">
                          {opp!.name}
                        </h3>
                        {opp!.description && (
                          <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{opp!.description}</p>
                        )}
                        {opp!.location && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <MapPin size={11} />
                            <span>{opp!.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#DC2626] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          Learn More <ArrowRight size={11} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* General CTA */}
              <div className="bg-zinc-950 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Open Volunteering</p>
                  <h3 className="font-serif text-xl font-bold text-white">Not finding what you&apos;re looking for?</h3>
                  <p className="text-sm text-white/50 mt-1">Register as a general volunteer and we&apos;ll find the right seva for you.</p>
                </div>
                <Link
                  href={`/a/${slug}/seva/general`}
                  className="flex-shrink-0 inline-flex items-center gap-2 border border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-full hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  General Volunteer <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
