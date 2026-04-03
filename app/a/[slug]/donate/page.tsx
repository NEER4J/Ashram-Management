import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { DonateForm } from "@/components/public/donate-form"
import { HandHeart, SealCheck, DeviceMobile } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("ashram_settings").select("ashram_name").eq("public_slug", slug).eq("is_public", true).single()
  return { title: data ? `Donate — ${data.ashram_name}` : "Donate" }
}

export default async function DonatePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data: ashram }, { data: categories }, { data: { user } }] = await Promise.all([
    supabase.from("ashram_settings").select("ashram_name, phone, email, upi_id").eq("public_slug", slug).eq("is_public", true).single(),
    supabase.from("master_donation_categories").select("id, name, description, is_80g_eligible").eq("is_active", true).order("name"),
    supabase.auth.getUser(),
  ])

  if (!ashram) notFound()

  let userProfile: { display_name?: string; phone?: string } | null = null
  if (user) {
    const { data } = await supabase.from("user_profiles").select("display_name, phone").eq("id", user.id).single()
    userProfile = data
  }

  return (
    <>
      <section className="bg-zinc-950 py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">Make a Donation</h1>
          <p className="mt-3 text-white/50 max-w-xl">
            Your contribution supports {ashram.ashram_name} and its sacred activities.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_420px] gap-12">
          {/* Left: why donate */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-6">Areas of Support</h2>
            <div className="space-y-2.5">
              {(categories || []).map(cat => (
                <div key={cat.id} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HandHeart size={17} weight="fill" className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-950 text-sm">{cat.name}</span>
                      {cat.is_80g_eligible && (
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <SealCheck size={10} weight="fill" />
                          80G
                        </div>
                      )}
                    </div>
                    {cat.description && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{cat.description}</p>}
                  </div>
                </div>
              ))}
              {(!categories || categories.length === 0) && (
                <p className="text-zinc-400 text-sm">All donations go towards ashram maintenance and spiritual activities.</p>
              )}
            </div>

            {ashram.upi_id && (
              <div className="mt-8 bg-zinc-950 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DeviceMobile size={16} weight="fill" className="text-amber-400" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Direct UPI Transfer</p>
                </div>
                <p className="font-mono font-bold text-white text-lg">{ashram.upi_id}</p>
                <p className="text-xs text-white/40 mt-2">Donate directly via any UPI app and mention your name.</p>
              </div>
            )}
          </div>

          {/* Right: form */}
          <div>
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 sticky top-24">
              
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-5">Donation Details</h3>
              <DonateForm
                slug={slug}
                categories={categories || []}
                defaultName={userProfile?.display_name || ""}
                defaultPhone={userProfile?.phone || ""}
                defaultEmail={user?.email || ""}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
