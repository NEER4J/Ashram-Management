import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { SevaSignupForm } from "@/components/public/seva-signup-form"
import { CheckCircle, HandHeart, MapPin, ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  if (id === "general") return { title: "Volunteer Registration" }
  const supabase = await createClient()
  const { data } = await supabase.from("seva_opportunities").select("name").eq("id", id).single()
  return { title: data?.name || "Seva" }
}

export default async function SevaDetailPage({ params }: Props) {
  const { slug, id } = await params
  const isGeneral = id === "general"
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let opportunity: { id: string; name: string; description?: string | null; category?: string | null; location?: string | null } | null = null
  if (!isGeneral) {
    const { data } = await supabase.from("seva_opportunities").select("id, name, description, category, location").eq("id", id).eq("is_active", true).single()
    if (!data) notFound()
    opportunity = data
  }

  let userProfile: { display_name?: string; phone?: string } | null = null
  if (user) {
    const { data } = await supabase.from("user_profiles").select("display_name, phone").eq("id", user.id).single()
    userProfile = data
  }

  // Check if already signed up
  let alreadySignedUp = false
  if (user) {
    const { data: vol } = await supabase.from("volunteers").select("id").eq("user_id", user.id).maybeSingle()
    alreadySignedUp = !!vol
  }

  return (
    <>
      <section className="bg-[#3C0212] py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link href={`/a/${slug}/seva`} className="inline-flex items-center gap-1.5 text-white/50 text-xs font-medium mb-6 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            All Seva
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 border border-[#DC2626]/30 flex items-center justify-center flex-shrink-0">
              <HandHeart size={20} weight="fill" className="text-[#DC2626]" />
            </div>
            {!isGeneral && opportunity!.category && (
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">
                {opportunity!.category}
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
            {isGeneral ? "Volunteer with Us" : opportunity!.name}
          </h1>
          {!isGeneral && opportunity!.location && (
            <div className="flex items-center gap-1.5 text-white/50 text-sm mt-3">
              <MapPin size={13} />
              <span>{opportunity!.location}</span>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-gray-100 min-h-[calc(100vh-300px)]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px] gap-10">
          <div>
            {!isGeneral && opportunity!.description && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">About This Seva</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{opportunity!.description}</p>
              </div>
            )}
            {isGeneral && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">Why Seva?</h2>
                <p className="text-zinc-600 leading-relaxed mb-4">
                  Seva (selfless service) is a cornerstone of ashram life. By volunteering your time and skills, you become part of a community dedicated to the upliftment of all beings.
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  We welcome volunteers for kitchen service, guest reception, maintenance, event management, education, and more.
                </p>
              </div>
            )}

            <div className="bg-zinc-50 rounded-2xl p-5">
              <h3 className="font-semibold text-zinc-950 mb-3">What to Expect</h3>
              <ul className="text-sm text-zinc-600 space-y-2">
                {[
                  "We will contact you within 3 working days",
                  "Flexible timing — daily, weekly, or for events",
                  "Accommodation available for long-term volunteers",
                  "Spiritual guidance and community living",
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={15} weight="fill" className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl p-6 sticky top-[80px] shadow-sm">
              
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-5">
                {alreadySignedUp ? "You&apos;re Registered" : "Register as Volunteer"}
              </h3>
              {alreadySignedUp ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} weight="fill" className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-zinc-600 mb-4">You&apos;ve already signed up as a volunteer. We&apos;ll be in touch!</p>
                  <Link href={`/a/${slug}/my`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline">
                    View My Portal <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <SevaSignupForm
                  opportunityId={isGeneral ? null : id}
                  slug={slug}
                  defaultName={userProfile?.display_name || ""}
                  defaultPhone={userProfile?.phone || ""}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
