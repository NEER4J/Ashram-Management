"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Users,
  Heart,
  Calendar,
  BedDouble,
  Wallet,
  BookOpen,
  UtensilsCrossed,
  HandHeart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */
type ActiveMenu = "features" | "resources" | null;

/* ─── Features Mega Menu ─────────────────────────────────────────────────────── */
const featureHighlights = [
  {
    icon: Users,
    title: "Devotee Management",
    desc: "Complete registry, relationships & engagement tracking.",
    href: "/#features",
  },
  {
    icon: Heart,
    title: "Donations & Receipts",
    desc: "80G receipts, donor history & in-kind donations.",
    href: "/#features",
  },
  {
    icon: Calendar,
    title: "Events & Registration",
    desc: "Publish events, manage registrations & attendance.",
    href: "/#features",
  },
  {
    icon: BedDouble,
    title: "Accommodation",
    desc: "Guest rooms, bookings, check-in & occupancy reports.",
    href: "/#features",
  },
];

const featureMore = [
  { icon: Wallet, title: "Accounting & GST", href: "/#features" },
  { icon: BookOpen, title: "Gurukul & Courses", href: "/gurukul" },
  { icon: UtensilsCrossed, title: "Kitchen & Prasad", href: "/#features" },
  { icon: HandHeart, title: "Seva & Volunteers", href: "/#features" },
];

function FeaturesMegaMenu({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div
      className="w-full border-b animate-mega-menu-in"
      style={{ backgroundColor: "#fbf9ef", borderColor: "#3c0212" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left — 4 feature cards */}
          <div className="md:col-span-8 grid grid-cols-2 gap-3">
            {featureHighlights.map((f) => {
              const Icon = f.icon;
              return (
                <Link
                  key={f.title}
                  href={f.href}
                  className="group flex gap-3 p-4 border transition-colors hover:border-[#3c0212]"
                  style={{ borderColor: "#3c0212", backgroundColor: "#fef9fb" }}
                >
                  <div
                    className="flex-shrink-0 p-2 border self-start"
                    style={{ borderColor: "#3c0212" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: "#3c0212" }} />
                  </div>
                  <div>
                    <div
                      className="font-semibold text-sm mb-0.5"
                      style={{ color: "#3c0212" }}
                    >
                      {f.title}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#3c0212", opacity: 0.6 }}>
                      {f.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right — more modules + CTA */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: "#3c0212", opacity: 0.45 }}
              >
                More Modules
              </p>
              <ul className="space-y-2">
                {featureMore.map((f) => {
                  const Icon = f.icon;
                  return (
                    <li key={f.title}>
                      <Link
                        href={f.href}
                        className="flex items-center gap-2.5 text-sm group transition-opacity hover:opacity-60"
                        style={{ color: "#3c0212" }}
                      >
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                        {f.title}
                        <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div
              className="mt-6 p-4 border"
              style={{ borderColor: "#3c0212", backgroundColor: "#3c0212" }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: "#fef9fb", opacity: 0.8 }}>
                Ready to get started?
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: "#fef9fb" }}
              >
                Start Free Trial
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Resources Mega Menu ────────────────────────────────────────────────────── */
const resourceCards = [
  {
    title: "Events",
    desc: "Browse upcoming spiritual events, satsangs & celebrations.",
    href: "/events",
    dark: true,
  },
  {
    title: "Gurukul Store",
    desc: "Courses, study materials and video content for devotees.",
    href: "/gurukul",
    dark: false,
  },
  {
    title: "Book a Stay",
    desc: "Reserve accommodation at the Ashram for your visit.",
    href: "/book-stay",
    dark: false,
  },
  {
    title: "Contact Support",
    desc: "Get help from our team. We are here for you.",
    href: "mailto:hello@virtualxcellence.com",
    dark: false,
  },
];

function ResourcesMegaMenu({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;

  return (
    <div
      className="w-full border-b animate-mega-menu-in"
      style={{ backgroundColor: "#fbf9ef", borderColor: "#3c0212" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {resourceCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col p-6 min-h-[160px] border transition-opacity hover:opacity-90"
              style={{
                borderColor: "#3c0212",
                backgroundColor: card.dark ? "#3c0212" : "#fef9fb",
              }}
            >
              <h3
                className="text-lg font-serif font-bold mb-2"
                style={{ color: card.dark ? "#fef9fb" : "#3c0212" }}
              >
                {card.title}
              </h3>
              <p
                className="text-xs leading-relaxed mb-auto"
                style={{ color: card.dark ? "#fef9fb" : "#3c0212", opacity: card.dark ? 0.8 : 0.65 }}
              >
                {card.desc}
              </p>
              <span
                className="inline-flex items-center text-xs font-semibold mt-4 transition-gap group-hover:gap-1"
                style={{ color: card.dark ? "#fef9fb" : "#3c0212" }}
              >
                Learn more
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
  const [mobileFeatureOpen, setMobileFeatureOpen] = useState(false);
  const [mobileResourceOpen, setMobileResourceOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const openMenu = useCallback(
    (menu: ActiveMenu) => {
      clearClose();
      setActiveMenu(menu);
    },
    [clearClose]
  );

  const scheduleClose = useCallback(() => {
    clearClose();
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  }, [clearClose]);

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
        style={{ backgroundColor: "rgba(251,249,239,0.92)", borderColor: "#3c0212" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[68px]">

            {/* Left: logo + desktop nav */}
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="font-serif text-2xl font-bold pr-6 transition-opacity hover:opacity-70"
                style={{ color: "#3c0212" }}
                onMouseEnter={() => setActiveMenu(null)}
              >
                Ashram
              </Link>

              {/* Features trigger */}
              <div
                className="hidden md:block relative"
                onMouseEnter={() => openMenu("features")}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                    activeMenu === "features" ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ color: "#3c0212" }}
                >
                  Features
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === "features" ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Pricing — direct link */}
              <Link
                href="/#pricing"
                className="hidden md:block px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: "#3c0212" }}
                onMouseEnter={() => setActiveMenu(null)}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(null);
                  document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Pricing
              </Link>

              {/* Resources trigger */}
              <div
                className="hidden md:block relative"
                onMouseEnter={() => openMenu("resources")}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                    activeMenu === "resources" ? "opacity-100" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ color: "#3c0212" }}
                >
                  Resources
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${activeMenu === "resources" ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Right: CTAs + hamburger */}
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                className="hidden md:flex text-sm font-medium rounded-none opacity-70 hover:opacity-100 hover:bg-transparent"
                style={{ color: "#3c0212" }}
                onMouseEnter={() => setActiveMenu(null)}
              >
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="hidden md:flex rounded-none text-sm font-semibold"
                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                onMouseEnter={() => setActiveMenu(null)}
              >
                <Link href="/auth/sign-up">Get Started Free</Link>
              </Button>

              {/* Mobile hamburger */}
              <button
                className="md:hidden relative w-10 h-10 flex items-center justify-center"
                style={{ color: "#3c0212" }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                <div className="w-5 h-5 relative flex items-center justify-center">
                  <span className={`absolute w-full h-0.5 transition-all duration-300 origin-center ${mobileOpen ? "rotate-45" : "-translate-y-1.5"}`} style={{ backgroundColor: "#3c0212" }} />
                  <span className={`absolute w-full h-0.5 transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : "opacity-100"}`} style={{ backgroundColor: "#3c0212" }} />
                  <span className={`absolute w-full h-0.5 transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45" : "translate-y-1.5"}`} style={{ backgroundColor: "#3c0212" }} />
                </div>
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
        style={{ top: "68px", backgroundColor: "rgba(60,2,18,0.15)" }}
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
        {activeMenu === "features" && <FeaturesMegaMenu isOpen />}
        {activeMenu === "resources" && <ResourcesMegaMenu isOpen />}
      </div>

      {/* ── Mobile overlay ───────────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(60,2,18,0.4)", backdropFilter: "blur(4px)" }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile sidebar ───────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 md:hidden flex flex-col overflow-y-auto border-l transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: "#fbf9ef", borderColor: "#3c0212" }}
      >
        {/* Header row */}
        <div
          className="flex items-center justify-between px-6 h-[68px] border-b flex-shrink-0"
          style={{ borderColor: "#3c0212" }}
        >
          <Link
            href="/"
            className="font-serif text-xl font-bold"
            style={{ color: "#3c0212" }}
            onClick={() => setMobileOpen(false)}
          >
            Ashram
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ color: "#3c0212" }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col flex-1 px-6 py-6 gap-1">
          {/* Features accordion */}
          <button
            className="flex items-center justify-between w-full py-3 text-base font-medium border-b"
            style={{ color: "#3c0212", borderColor: "#3c0212" }}
            onClick={() => setMobileFeatureOpen(!mobileFeatureOpen)}
          >
            Features
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileFeatureOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileFeatureOpen && (
            <div className="py-3 pl-2 flex flex-col gap-3">
              {[...featureHighlights, ...featureMore].map((f) => {
                const Icon = f.icon;
                return (
                  <Link
                    key={f.title}
                    href={f.href}
                    className="flex items-center gap-2.5 text-sm transition-opacity hover:opacity-60"
                    style={{ color: "#3c0212" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                    {f.title}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pricing */}
          <button
            className="flex items-center w-full py-3 text-base font-medium border-b"
            style={{ color: "#3c0212", borderColor: "#3c0212" }}
            onClick={() => {
              setMobileOpen(false);
              setTimeout(() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" }), 100);
            }}
          >
            Pricing
          </button>

          {/* Resources accordion */}
          <button
            className="flex items-center justify-between w-full py-3 text-base font-medium border-b"
            style={{ color: "#3c0212", borderColor: "#3c0212" }}
            onClick={() => setMobileResourceOpen(!mobileResourceOpen)}
          >
            Resources
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileResourceOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileResourceOpen && (
            <div className="py-3 pl-2 flex flex-col gap-3">
              {resourceCards.map((c) => (
                <Link
                  key={c.title}
                  href={c.href}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ color: "#3c0212" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {c.title}
                </Link>
              ))}
            </div>
          )}

          {/* Bottom CTAs */}
          <div className="mt-auto pt-6 flex flex-col gap-3">
            <Button
              asChild
              variant="outline"
              className="w-full rounded-none border-2 font-semibold"
              style={{ borderColor: "#3c0212", color: "#3c0212", backgroundColor: "transparent" }}
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="w-full rounded-none font-semibold"
              style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
              onClick={() => setMobileOpen(false)}
            >
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
