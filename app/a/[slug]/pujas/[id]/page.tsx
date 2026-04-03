import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { PujaBookForm } from "@/components/public/puja-book-form"
import { Flame, Clock, CheckCircle, ArrowLeft } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("master_pujas").select("name").eq("id", id).single()
  return { title: data?.name || "Puja Booking" }
}

export default async function PujaDetailPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = await createClient()

  const [{ data: puja }, { data: nakshatras }, { data: rashis }, { data: { user } }] = await Promise.all([
    supabase.from("master_pujas").select("id, name, type, description, base_amount, duration_minutes").eq("id", id).eq("is_active", true).single(),
    supabase.from("master_nakshatras").select("name").order("name"),
    supabase.from("master_rashis").select("name").order("name"),
    supabase.auth.getUser(),
  ])

  if (!puja) notFound()

  let userProfile: { display_name?: string; phone?: string } | null = null
  if (user) {
    const { data } = await supabase.from("user_profiles").select("display_name, phone").eq("id", user.id).single()
    userProfile = data
  }

  const isFree = Number(puja.base_amount) === 0

  return (
    <>
      <section className="bg-[#3C0212] py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link href={`/a/${slug}/pujas`} className="inline-flex items-center gap-1.5 text-white/50 text-xs font-medium mb-6 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            All Pujas
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Flame size={18} weight="fill" className="text-[#DC2626]" />
            </div>
            {puja.type && <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{puja.type}</span>}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-3">{puja.name}</h1>
          <div className="flex items-center gap-4 text-white/50 text-sm">
            <span className="font-bold text-white/80">{isFree ? "Free" : `₹${Number(puja.base_amount).toLocaleString("en-IN")}`}</span>
            {puja.duration_minutes && <span>· {puja.duration_minutes} minutes</span>}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-gray-100 min-h-[calc(100vh-300px)]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            {puja.description && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">About this Puja</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{puja.description}</p>
              </div>
            )}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="font-semibold text-amber-900 mb-3">What to prepare</h3>
              <ul className="text-sm text-amber-800 space-y-2">
                {["Sankalpa details (your name, nakshatra, gotra)", "Names of family members to be included", "Preferred date and time", "Confirm arrival 15 minutes before puja time"].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={14} weight="fill" className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl p-6 sticky top-[80px] shadow-sm">
              
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1">Book This Puja</h3>
              <p className="text-sm text-zinc-400 mb-5">
                {isFree ? "No charge" : `₹${Number(puja.base_amount).toLocaleString("en-IN")}`}
              </p>
              <PujaBookForm
                pujaId={id}
                pujaName={puja.name}
                amount={Number(puja.base_amount)}
                slug={slug}
                nakshatras={(nakshatras || []).map(n => n.name)}
                rashis={(rashis || []).map(r => r.name)}
                defaultName={userProfile?.display_name || ""}
                defaultPhone={userProfile?.phone || ""}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
