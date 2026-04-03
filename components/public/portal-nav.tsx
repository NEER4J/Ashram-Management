"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { House, Bed, BookOpen, HandHeart, Flame, UserCircle, CalendarBlank, Hand } from "@phosphor-icons/react"

const NAV = [
  { label: "Overview",  href: "",          Icon: House },
  { label: "Bookings",  href: "/bookings", Icon: Bed },
  { label: "Events",    href: "/events",   Icon: CalendarBlank },
  { label: "Courses",   href: "/courses",  Icon: BookOpen },
  { label: "Donations", href: "/donations",Icon: HandHeart },
  { label: "Pujas",     href: "/pujas",    Icon: Flame },
  { label: "Seva",      href: "/seva",     Icon: Hand },
  { label: "Profile",   href: "/profile",  Icon: UserCircle },
]

export function PortalNav({ slug }: { slug: string }) {
  const pathname = usePathname()
  const base     = `/a/${slug}/my`

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col p-3 gap-0.5">
        {NAV.map(({ label, href, Icon }) => {
          const fullHref = `${base}${href}`
          const isActive = href === "" ? pathname === base : pathname.startsWith(fullHref)
          return (
            <Link
              key={href}
              href={fullHref}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#DC2626] text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile horizontal tabs */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2.5 gap-1">
        {NAV.map(({ label, href, Icon }) => {
          const fullHref = `${base}${href}`
          const isActive = href === "" ? pathname === base : pathname.startsWith(fullHref)
          return (
            <Link
              key={href}
              href={fullHref}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                isActive
                  ? "bg-[#DC2626] text-white"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              <Icon size={14} weight={isActive ? "fill" : "regular"} />
              {label}
            </Link>
          )
        })}
      </div>
    </>
  )
}
