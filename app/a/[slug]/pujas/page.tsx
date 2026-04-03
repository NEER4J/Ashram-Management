import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { Flame, Clock, ArrowRight, CurrencyInr } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("ashram_settings").select("ashram_name").eq("public_slug", slug).eq("is_public", true).single()
  return { title: data ? `Pujas — ${data.ashram_name}` : "Pujas" }
}

export default async function PujasPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: ashram }, { data: pujas }] = await Promise.all([
    supabase.from("ashram_settings").select("ashram_name").eq("public_slug", slug).eq("is_public", true).single(),
    supabase.from("master_pujas").select("id, name, type, description, base_amount, duration_minutes").eq("is_active", true).order("type").order("name"),
  ])

  if (!ashram) notFound()

  const grouped = (pujas || []).reduce<Record<string, typeof pujas>>((acc, p) => {
    const key = p!.type || "Other"
    if (!acc[key]) acc[key] = []
    acc[key]!.push(p)
    return acc
  }, {})

  const types = Object.keys(grouped).sort()
  const total = (pujas || []).length

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] pt-16 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto pb-16">
          
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
                Puja<br />Booking
              </h1>
              <p className="mt-3 text-white/50 max-w-md">
                Book sacred pujas and ceremonies at {ashram.ashram_name}. Our priests will perform with full devotion and vedic tradition.
              </p>
            </div>
            {total > 0 && (
              <div className="hidden md:block text-right flex-shrink-0">
                <div className="font-serif text-6xl font-bold text-white leading-none">{total}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">pujas available</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 bg-gray-100 pb-20 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {types.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Flame size={28} weight="thin" className="text-red-400" />
              </div>
              <p className="text-zinc-400 font-medium">Puja booking details coming soon.</p>
            </div>
          ) : (
            <div className="space-y-14 pt-4">
              {types.map(type => (
                <div key={type}>
                  {/* Type header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                        <Flame size={13} weight="fill" className="text-[#DC2626]" />
                      </div>
                      <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#DC2626]">{type} Pujas</p>
                    </div>
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[10px] font-bold text-zinc-400">{grouped[type]!.length} available</span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {grouped[type]!.map(puja => (
                      <Link
                        key={puja!.id}
                        href={`/a/${slug}/pujas/${puja!.id}`}
                        className="group bg-white border border-zinc-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-zinc-200 transition-all block"
                      >

                        <div className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                              <Flame size={18} weight="fill" className="text-[#DC2626]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif text-lg font-bold text-zinc-950 leading-tight group-hover:text-[#DC2626] transition-colors">
                                {puja!.name}
                              </h3>
                            </div>
                          </div>

                          {puja!.description && (
                            <p className="text-sm text-zinc-500 line-clamp-2 mb-4 leading-relaxed">{puja!.description}</p>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                            <div className="flex items-center gap-1.5">
                              {Number(puja!.base_amount) === 0 ? (
                                <span className="text-sm font-bold text-emerald-600">Free</span>
                              ) : (
                                <>
                                  <CurrencyInr size={14} weight="bold" className="text-zinc-700" />
                                  <span className="font-bold text-zinc-950 text-base">
                                    {Number(puja!.base_amount).toLocaleString("en-IN")}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {puja!.duration_minutes && (
                                <span className="flex items-center gap-1 text-xs text-zinc-400">
                                  <Clock size={11} />
                                  {puja!.duration_minutes} min
                                </span>
                              )}
                              <ArrowRight size={14} className="text-zinc-300 group-hover:text-[#DC2626] transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
