"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CurrencyIcon,
  CalendarCheck,
  Bed,
  BookOpen,
  UtensilsCrossed,
  HandHeart,
  Wallet,
  Package,
  Stethoscope,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ActiveMenu = "features" | "solutions" | "resources" | null;

/* ─── Features Mega Menu ─────────────────────────────────────────────────────── */
const featureHighlights = [
  { icon: Users,         title: "Devotee Management",   desc: "Registry, families, relationships & engagement.",      href: "/features#devotees" },
  { icon: CurrencyIcon,  title: "Donations & Receipts", desc: "80G receipts, donor history & in-kind donations.",      href: "/features#donations" },
  { icon: CalendarCheck, title: "Events & Registration", desc: "Publish events, registrations & QR check-in.",          href: "/features#events" },
  { icon: Bed,           title: "Accommodation",        desc: "Guest rooms, bookings & occupancy reports.",             href: "/features#accommodation" },
];

const featureMore = [
  { icon: Wallet,         title: "Accounting & GST",  href: "/features#accounting" },
  { icon: GraduationCap, title: "Gurukul & Courses",  href: "/features#gurukul" },
  { icon: UtensilsCrossed, title: "Kitchen & Prasad", href: "/features#kitchen" },
  { icon: HandHeart,     title: "Seva & Volunteers",  href: "/features#seva" },
  { icon: Package,       title: "Inventory",          href: "/features#inventory" },
  { icon: Stethoscope,   title: "Medical & Wellness", href: "/features#medical" },
];

function FeaturesMegaMenu({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="w-full border-b border-zinc-100 bg-white animate-mega-menu-in shadow-soft-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left — 4 feature cards */}
          <div className="col-span-7 grid grid-cols-2 gap-3">
            {featureHighlights.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  href={f.href}
                  className="group flex gap-3 p-4 border border-zinc-100 hover:border-[#DC2626]/30 hover:bg-[#DC2626]/[0.02] transition-all duration-150"
                >
                  <div className="flex-shrink-0 p-2 bg-zinc-50 group-hover:bg-[#DC2626]/10 transition-colors self-start">
                    <Icon className="h-4 w-4 text-zinc-500 group-hover:text-[#DC2626] transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-zinc-900 mb-0.5 group-hover:text-[#DC2626] transition-colors">{f.title}</div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Center — more modules */}
          <div className="col-span-3">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-3">More Modules</p>
            <ul className="space-y-1.5">
              {featureMore.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title}>
                    <Link
                      href={f.href}
                      className="flex items-center gap-2.5 text-sm text-zinc-600 hover:text-zinc-950 group transition-colors py-1"
                    >
                      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400 group-hover:text-[#DC2626] transition-colors" />
                      {f.title}
                      <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Right — CTA card */}
          <div className="col-span-2">
            <div className="h-full bg-[#09090B] p-5 flex flex-col justify-between">
              <div>
                <BookOpen className="h-5 w-5 text-white/40 mb-3" />
                <p className="text-sm font-semibold text-white leading-snug mb-1">Built for India's spiritual communities</p>
                <p className="text-xs text-white/50 leading-relaxed">Every feature purpose-built for Ashrams, temples, and trusts.</p>
              </div>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors mt-4"
              >
                Start Free Trial <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Solutions Mega Menu ────────────────────────────────────────────────────── */
const solutionsByType = [
  { label: "Ashrams & Monasteries",   href: "/solutions#ashrams" },
  { label: "Temples & Math",          href: "/solutions#temples" },
  { label: "Yoga Institutes",         href: "/solutions#yoga" },
  { label: "Trusts & NGOs",           href: "/solutions#trusts" },
  { label: "Vedic Schools (Gurukul)", href: "/solutions#vedic" },
];

const solutionsByUseCase = [
  { label: "Manage Devotees",    href: "/features#devotees" },
  { label: "Accept Donations",   href: "/features#donations" },
  { label: "Run Events",         href: "/features#events" },
  { label: "Teach Online",       href: "/features#gurukul" },
  { label: "Handle Accounts",    href: "/features#accounting" },
  { label: "Manage Volunteers",  href: "/features#seva" },
];

function SolutionsMegaMenu({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="w-full border-b border-zinc-100 bg-white animate-mega-menu-in shadow-soft-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* By Org Type */}
          <div className="col-span-4">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-4">By Organisation Type</p>
            <ul className="space-y-1">
              {solutionsByType.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="flex items-center justify-between group py-2 border-b border-zinc-50 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    {s.label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-[#DC2626]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* By Use Case */}
          <div className="col-span-4">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-4">By Use Case</p>
            <ul className="space-y-1">
              {solutionsByUseCase.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="flex items-center justify-between group py-2 border-b border-zinc-50 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                  >
                    {s.label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity text-[#DC2626]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured card */}
          <div className="col-span-4">
            <div
              className="h-full min-h-[220px] relative overflow-hidden"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&q=70')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-xs text-white/60 mb-1.5">Customer Story</p>
                <p className="text-sm font-semibold text-white leading-snug mb-3">
                  "Setup took 10 minutes. Now we manage 1,200 devotees effortlessly."
                </p>
                <Link
                  href="/about"
                  className="text-xs font-semibold text-[#DC2626] hover:text-red-400 transition-colors inline-flex items-center gap-1"
                >
                  Read more <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Resources Mega Menu ────────────────────────────────────────────────────── */
const resourceCards = [
  { title: "Events",        desc: "Browse upcoming spiritual events and satsangs.",       href: "/events",     dark: true },
  { title: "Gurukul Store", desc: "Courses, study materials & video content.",            href: "/gurukul",    dark: false },
  { title: "Book a Stay",   desc: "Reserve accommodation at the Ashram.",                href: "/book-stay",  dark: false },
  { title: "Blog",          desc: "Insights and guides for Ashram administrators.",      href: "/blog",       dark: false },
  { title: "Contact",       desc: "Get in touch with our team.",                          href: "/contact",    dark: false },
  { title: "Changelog",     desc: "See what's new in the platform.",                    href: "/changelog",  dark: false },
];

function ResourcesMegaMenu({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  return (
    <div className="w-full border-b border-zinc-100 bg-white animate-mega-menu-in shadow-soft-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-3">
          {resourceCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group flex flex-col p-5 border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-soft-md ${
                card.dark
                  ? "bg-[#09090B] border-transparent"
                  : "bg-white border-zinc-100 hover:border-[#DC2626]/20"
              }`}
            >
              <h3 className={`font-serif text-base font-bold mb-1.5 ${card.dark ? "text-white" : "text-zinc-900"}`}>
                {card.title}
              </h3>
              <p className={`text-xs leading-relaxed flex-1 ${card.dark ? "text-white/55" : "text-zinc-500"}`}>
                {card.desc}
              </p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-4 ${card.dark ? "text-white/60 group-hover:text-white" : "text-[#DC2626]"} transition-colors`}>
                Explore <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Header ────────────────────────────────────────────────────────────── */
export function Header() {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const openMenu = useCallback((menu: ActiveMenu) => {
    clearClose();
    setActiveMenu(menu);
  }, [clearClose]);

  const scheduleClose = useCallback(() => {
    clearClose();
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, [clearClose]);

  const NavTrigger = ({ menu, label }: { menu: ActiveMenu; label: string }) => (
    <div
      className="hidden md:block relative"
      onMouseEnter={() => openMenu(menu)}
      onMouseLeave={scheduleClose}
    >
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
          activeMenu === menu
            ? "text-zinc-950"
            : "text-zinc-500 hover:text-zinc-950"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === menu ? "rotate-180" : ""}`} />
      </button>
      {activeMenu === menu && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#DC2626]" />
      )}
    </div>
  );

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-100/80 backdrop-blur-md"
        style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">

            {/* Left: logo + desktop nav */}
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="font-serif text-2xl font-bold pr-5 text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Ashram
              </Link>

              <NavTrigger menu="features" label="Features" />

              <NavTrigger menu="solutions" label="Solutions" />

              <Link
                href="/pricing"
                className="hidden md:block px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Pricing
              </Link>

              <Link
                href="/blog"
                className="hidden md:block px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Blog
              </Link>

              <NavTrigger menu="resources" label="Resources" />
            </div>

            {/* Right: CTAs + hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="hidden md:block px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Log in
              </Link>
              <Link
                href="/auth/sign-up"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
                onMouseEnter={() => setActiveMenu(null)}
              >
                Get Started Free
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden relative w-10 h-10 flex items-center justify-center text-zinc-700"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : (
                  <div className="space-y-1.5">
                    <span className="block w-5 h-0.5 bg-current" />
                    <span className="block w-5 h-0.5 bg-current" />
                    <span className="block w-5 h-0.5 bg-current" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-30 hidden md:block transition-opacity duration-200 ${
          activeMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "68px", backgroundColor: "rgba(0,0,0,0.08)" }}
        onMouseEnter={() => setActiveMenu(null)}
      />

      {/* ── Mega menu container ───────────────────────────────────────────────── */}
      <div
        className={`fixed top-[68px] left-0 right-0 z-40 hidden md:block ${
          activeMenu ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onMouseEnter={clearClose}
        onMouseLeave={scheduleClose}
      >
        {activeMenu === "features"  && <FeaturesMegaMenu isOpen />}
        {activeMenu === "solutions" && <SolutionsMegaMenu isOpen />}
        {activeMenu === "resources" && <ResourcesMegaMenu isOpen />}
      </div>

      {/* ── Mobile overlay ───────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile sidebar ───────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 md:hidden flex flex-col overflow-y-auto border-l border-zinc-100 bg-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-zinc-100 flex-shrink-0">
          <Link
            href="/"
            className="font-serif text-xl font-bold text-[#DC2626]"
            onClick={() => setMobileOpen(false)}
          >
            Ashram
          </Link>
          <button onClick={() => setMobileOpen(false)} className="text-zinc-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 px-6 py-6 gap-0.5">
          {/* Features accordion */}
          {(["features", "solutions", "resources"] as const).map((menu) => {
            const labels: Record<string, string> = { features: "Features", solutions: "Solutions", resources: "Resources" };
            const links: Record<string, { label: string; href: string }[]> = {
              features: [
                ...featureHighlights.map((f) => ({ label: f.title, href: f.href })),
                ...featureMore.map((f) => ({ label: f.title, href: f.href })),
              ],
              solutions: [
                ...solutionsByType.map((s) => ({ label: s.label, href: s.href })),
                ...solutionsByUseCase.map((s) => ({ label: s.label, href: s.href })),
              ],
              resources: resourceCards.map((c) => ({ label: c.title, href: c.href })),
            };
            return (
              <div key={menu}>
                <button
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-zinc-700 border-b border-zinc-100"
                  onClick={() => setMobileExpanded(mobileExpanded === menu ? null : menu)}
                >
                  {labels[menu]}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpanded === menu ? "rotate-180" : ""}`} />
                </button>
                {mobileExpanded === menu && (
                  <div className="py-3 pl-2 flex flex-col gap-2">
                    {links[menu].map((l) => (
                      <Link
                        key={l.label}
                        href={l.href}
                        className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors py-0.5"
                        onClick={() => setMobileOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/pricing" className="py-3 text-sm font-medium text-zinc-700 border-b border-zinc-100 block" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link href="/blog" className="py-3 text-sm font-medium text-zinc-700 border-b border-zinc-100 block" onClick={() => setMobileOpen(false)}>
            Blog
          </Link>

          {/* Bottom CTAs */}
          <div className="mt-auto pt-6 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="w-full border-2 border-zinc-900 text-center text-sm font-semibold py-3 text-zinc-900 hover:bg-zinc-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="w-full bg-[#DC2626] text-center text-sm font-semibold py-3 text-white hover:bg-[#B91C1C] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
