import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  CheckCircleIcon, BedIcon, CalendarBlankIcon, FlameIcon,
  HandHeartIcon, BookOpenIcon, HandIcon, ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr"

type TxType = "booking" | "event" | "puja" | "donation" | "course" | "seva"

const TYPE_CONFIG: Record<TxType, {
  Icon: typeof BedIcon
  bg: string
  color: string
  title: string
  message: string
  label: string
  cta: string
  ctaPath: string
}> = {
  booking: {
    Icon: BedIcon,
    bg: "bg-blue-50", color: "text-blue-600",
    title: "Booking Confirmed!",
    message: "Your reservation is pending confirmation. The ashram will reach out within 24 hours.",
    label: "Stay Booking",
    cta: "View My Bookings", ctaPath: "/my/bookings",
  },
  event: {
    Icon: CalendarBlankIcon,
    bg: "bg-violet-50", color: "text-violet-600",
    title: "Registration Successful!",
    message: "You are registered for the event. We'll send event details to your contact.",
    label: "Event Registration",
    cta: "View My Events", ctaPath: "/my/events",
  },
  puja: {
    Icon: FlameIcon,
    bg: "bg-red-50", color: "text-red-600",
    title: "Puja Booked!",
    message: "Your puja booking is confirmed. Please arrive 15 minutes early on the day.",
    label: "Puja Booking",
    cta: "View My Pujas", ctaPath: "/my/pujas",
  },
  donation: {
    Icon: HandHeartIcon,
    bg: "bg-amber-50", color: "text-amber-600",
    title: "Thank You!",
    message: "Your generosity is greatly appreciated. May you be blessed with peace and prosperity.",
    label: "Donation",
    cta: "View My Donations", ctaPath: "/my/donations",
  },
  course: {
    Icon: BookOpenIcon,
    bg: "bg-emerald-50", color: "text-emerald-600",
    title: "Enrolled Successfully!",
    message: "You now have access to this course. You can begin learning at any time.",
    label: "Course Enrollment",
    cta: "View My Courses", ctaPath: "/my/courses",
  },
  seva: {
    Icon: HandIcon,
    bg: "bg-teal-50", color: "text-teal-600",
    title: "Thank You for Your Seva!",
    message: "We'll review your application and reach out to confirm your volunteer role.",
    label: "Seva Registration",
    cta: "View My Seva", ctaPath: "/my/seva",
  },
}

interface Props {
  params:       Promise<{ slug: string }>
  searchParams: Promise<{ type?: string; code?: string; name?: string }>
}

export default async function CheckoutConfirmationPage({ params, searchParams }: Props) {
  const { slug }               = await params
  const { type, code, name }   = await searchParams

  const txType = (type || "booking") as TxType
  const config = TYPE_CONFIG[txType]
  if (!config) notFound()

  const supabase = await createClient()
  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single()

  if (!ashram) notFound()

  const { Icon, bg, color, title, message, label, cta, ctaPath } = config
  const displayName = name ? decodeURIComponent(name) : null

  return (
    <div className="min-h-[70vh] bg-zinc-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-10 max-w-md w-full text-center">

        {/* Type icon */}
        <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-5`}>
          <Icon size={30} weight="fill" className={color} />
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5 mb-5">
          <CheckCircleIcon size={13} weight="fill" />
          <span className="text-xs font-semibold">{label}</span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2">{title}</h1>

        {/* Item name */}
        {displayName && (
          <p className="text-zinc-700 font-medium text-base mb-3">{displayName}</p>
        )}

        {/* Reference code */}
        {code && (
          <div className="inline-flex items-center gap-2.5 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reference</span>
            <span className="font-mono text-sm font-bold text-zinc-950">{code}</span>
          </div>
        )}

        <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">{message}</p>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          <Link
            href={`/a/${slug}${ctaPath}`}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#DC2626] text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            {cta}
            <ArrowRightIcon size={14} />
          </Link>
          <Link
            href={`/a/${slug}`}
            className="w-full inline-flex items-center justify-center border border-zinc-200 text-zinc-600 font-semibold text-sm py-3.5 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
          >
            Back to Ashram
          </Link>
        </div>
      </div>
    </div>
  )
}
