"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Menu, X, ChevronDown, LogOut, User, CalendarDays, BookOpen, Bed, Flame, Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AshramPublicHeaderProps {
  ashram: {
    ashram_name: string
    logo_url?: string | null
    favicon_url?: string | null
    public_slug: string
  }
}

const NAV_LINKS = (slug: string) => [
  { label: "Events",  href: `/a/${slug}/events`  },
  { label: "Courses", href: `/a/${slug}/courses` },
  { label: "Stay",    href: `/a/${slug}/stay`    },
  { label: "Donate",  href: `/a/${slug}/donate`  },
  { label: "Pujas",   href: `/a/${slug}/pujas`   },
  { label: "Seva",    href: `/a/${slug}/seva`    },
]

const PORTAL_LINKS = (slug: string) => [
  { label: "My Portal",   href: `/a/${slug}/my`,           Icon: User },
  { label: "My Bookings", href: `/a/${slug}/my/bookings`,  Icon: Bed },
  { label: "My Events",   href: `/a/${slug}/my/events`,    Icon: CalendarDays },
  { label: "My Courses",  href: `/a/${slug}/my/courses`,   Icon: BookOpen },
  { label: "My Pujas",    href: `/a/${slug}/my/pujas`,     Icon: Flame },
  { label: "My Donations",href: `/a/${slug}/my/donations`, Icon: Heart },
]

export function AshramPublicHeader({ ashram }: AshramPublicHeaderProps) {
  const slug            = ashram.public_slug
  const [scrolled, setScrolled]       = useState(false)
  const [menuOpen, setMenuOpen]       = useState(false)
  const [user, setUser]               = useState<{ id: string; email?: string } | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const dropdownRef                   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        supabase.from("user_profiles").select("display_name, role").eq("id", user.id).single()
          .then(({ data }) => {
            if (data?.role !== "admin") {
              setDisplayName(data?.display_name || user.email?.split("@")[0] || "My Account")
            }
          })
      }
    })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.reload()
  }

  const navLinks   = NAV_LINKS(slug)
  const textCls    = "text-zinc-600 hover:text-zinc-950"
  const initials   = displayName ? displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : ""

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-zinc-100 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-0 flex items-center justify-between h-[64px]">

        {/* Logo */}
        <Link href={`/a/${slug}`}
          className="flex items-center gap-2.5 font-serif text-xl font-bold text-zinc-950 hover:text-[#DC2626] transition-colors">
          {ashram.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ashram.logo_url} alt={ashram.ashram_name} className="h-8 w-8 object-contain rounded-md" />
          )}
          {ashram.ashram_name}
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-5 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className={`transition-colors ${textCls}`}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: auth + CTA */}
        <div className="flex items-center gap-3">
          {user && displayName ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(o => !o)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${textCls}`}
              >
                <div className="w-7 h-7 rounded-full bg-[#DC2626] flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white">
                  {initials}
                </div>
                <span className="max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${accountOpen ? "rotate-180" : ""}`} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-zinc-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-zinc-50 mb-1">
                    <p className="text-xs font-semibold text-zinc-950 truncate">{displayName}</p>
                    <p className="text-[10px] text-zinc-400">My Account</p>
                  </div>
                  {PORTAL_LINKS(slug).map(({ label, href, Icon }) => (
                    <Link key={href} href={href}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-zinc-100 mt-1 pt-1">
                    <Link href={`/a/${slug}/my/profile`} onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      Profile
                    </Link>
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/a/${slug}/login`}
              className={`hidden sm:block text-sm font-medium transition-colors ${textCls}`}>
              Sign In
            </Link>
          )}

          <Link href={`/a/${slug}/stay`}
            className="bg-[#DC2626] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#B91C1C] transition-colors">
            Book Stay
          </Link>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-1.5 rounded-md text-zinc-700 hover:bg-zinc-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-zinc-100 shadow-lg">
          <div className="px-4 py-2">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50">
            {user && displayName ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-zinc-200">
                  <div className="w-9 h-9 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">{displayName}</p>
                    <p className="text-[10px] text-zinc-400">My Portal</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: "My Portal",   href: `/a/${slug}/my` },
                    { label: "My Bookings", href: `/a/${slug}/my/bookings` },
                    { label: "My Events",   href: `/a/${slug}/my/events` },
                    { label: "My Courses",  href: `/a/${slug}/my/courses` },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                      className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-2 hover:border-[#DC2626]/30 text-center">
                      {item.label}
                    </Link>
                  ))}
                </div>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-zinc-500 py-2 hover:text-zinc-700">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href={`/a/${slug}/login`} onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-[#DC2626] py-2">
                Sign In / Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
