import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { EventRegisterForm } from "@/components/public/event-register-form"
import { CheckCircle, MapPin, ArrowLeft, ArrowRight, Users, Broadcast, Phone, ChatCircle } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string; eventId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("temple_events").select("name").eq("id", eventId).single()
  return { title: data?.name || "Event" }
}

export default async function AshramEventDetailPage({ params }: Props) {
  const { slug, eventId } = await params
  const supabase = await createClient()

  const [{ data: event }, { data: ashram }, { data: { user } }] = await Promise.all([
    supabase
      .from("temple_events")
      .select("id, name, description, subtitle, type, start_date, end_date, city, state, hero_image_url, capacity, registration_fee, is_registration_open, max_registrations, stream_url, speaker_facilitator_id, contact_phone, whatsapp_number")
      .eq("id", eventId)
      .eq("is_published", true)
      .single(),
    supabase.from("ashram_settings").select("ashram_name, public_slug").eq("public_slug", slug).eq("is_public", true).single(),
    supabase.auth.getUser(),
  ])

  if (!event || !ashram) notFound()

  const start = new Date(event.start_date)
  const end = event.end_date ? new Date(event.end_date) : null
  const location = [event.city, event.state].filter(Boolean).join(", ")
  const isFree = !event.registration_fee || Number(event.registration_fee) === 0
  const heroImage = event.hero_image_url || "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1400&q=85"

  // Check if already registered
  let alreadyRegistered = false
  if (user) {
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle()
    alreadyRegistered = !!reg
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px] flex items-end overflow-hidden">
        <Image src={heroImage} alt={event.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pb-10">
          <Link href={`/a/${slug}/events`} className="inline-flex items-center gap-1.5 text-white/60 text-xs font-medium mb-5 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            All Events
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {event.type && (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/15 text-white px-3 py-1 rounded-full">
                {event.type}
              </span>
            )}
            {isFree ? (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-white px-3 py-1 rounded-full">Free</span>
            ) : (
              <span className="text-[10px] font-bold tracking-wider uppercase bg-[#DC2626] text-white px-3 py-1 rounded-full">
                ₹{Number(event.registration_fee).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-3">{event.name}</h1>
          {event.subtitle && <p className="text-white/70 text-base max-w-xl">{event.subtitle}</p>}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 bg-gray-100 min-h-[calc(100vh-300px)]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_360px] gap-10">

          {/* Left: details */}
          <div>
            {/* Meta chips */}
            <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-zinc-100">
              <div className="text-center bg-zinc-50 rounded-2xl px-5 py-4 min-w-[80px]">
                <div className="font-serif text-4xl font-bold text-zinc-950 leading-none">
                  {start.toLocaleDateString("en-IN", { day: "numeric" })}
                </div>
                <div className="text-[10px] font-bold uppercase text-[#DC2626] mt-1">
                  {start.toLocaleDateString("en-IN", { month: "short" })}
                </div>
                <div className="text-[10px] text-zinc-400">{start.getFullYear()}</div>
              </div>
              {end && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <ArrowRight size={14} />
                  <div className="text-center bg-zinc-50 rounded-2xl px-5 py-4">
                    <div className="font-serif text-4xl font-bold text-zinc-950 leading-none">
                      {end.toLocaleDateString("en-IN", { day: "numeric" })}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-[#DC2626] mt-1">
                      {end.toLocaleDateString("en-IN", { month: "short" })}
                    </div>
                    <div className="text-[10px] text-zinc-400">{end.getFullYear()}</div>
                  </div>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <MapPin size={16} className="text-zinc-400 flex-shrink-0" />
                  <span>{location}</span>
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Users size={16} className="text-zinc-400 flex-shrink-0" />
                  <span>{event.capacity} capacity</span>
                </div>
              )}
            </div>

            {event.description && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">About this Event</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              </div>
            )}

            {event.stream_url && (
              <div className="bg-zinc-50 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Broadcast size={18} weight="fill" className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-950 mb-0.5">Live Stream Available</p>
                  <a href={event.stream_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[#DC2626] hover:underline">
                    Watch live <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right: registration card */}
          <div>
            <div className="bg-white rounded-3xl p-6 sticky top-[80px] shadow-sm">
              
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-1">
                {alreadyRegistered ? "You're Registered!" : isFree ? "Register Free" : `Register · ₹${Number(event.registration_fee).toLocaleString("en-IN")}`}
              </h3>
              {event.is_registration_open === false ? (
                <div className="mt-4 text-center py-6">
                  <p className="text-zinc-400 text-sm">Registration is currently closed.</p>
                </div>
              ) : alreadyRegistered ? (
                <div className="mt-4 text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={24} weight="fill" className="text-emerald-500" />
                  </div>
                  <p className="text-sm text-zinc-600">You&apos;ve already registered for this event.</p>
                  <Link href={`/a/${slug}/my`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline">
                    View in My Portal <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <EventRegisterForm
                  eventId={eventId}
                  slug={slug}
                  registrationFee={Number(event.registration_fee) || 0}
                  eventName={event.name}
                  isLoggedIn={!!user}
                />
              )}

              {(event.contact_phone || event.whatsapp_number) && (
                <div className="mt-5 pt-5 border-t border-zinc-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Contact</p>
                  {event.contact_phone && (
                    <a href={`tel:${event.contact_phone}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-1.5">
                      <Phone size={13} className="text-zinc-400" />
                      {event.contact_phone}
                    </a>
                  )}
                  {event.whatsapp_number && (
                    <a
                      href={`https://wa.me/${event.whatsapp_number.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
                    >
                      <ChatCircle size={13} className="text-zinc-400" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
