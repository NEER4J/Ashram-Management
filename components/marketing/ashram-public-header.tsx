"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface AshramPublicHeaderProps {
  ashram: {
    ashram_name: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    public_slug: string;
  };
}

export function AshramPublicHeader({ ashram }: AshramPublicHeaderProps) {
  const slug = ashram.public_slug;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Events",      href: `/a/${slug}/events`  },
    { label: "Courses",     href: `/a/${slug}/courses` },
    { label: "Book a Stay", href: `/a/${slug}/stay`    },
    { label: "Contact",     href: `/a/${slug}#contact` },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-zinc-100 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[64px]">

        {/* Logo + name */}
        <Link
          href={`/a/${slug}`}
          className={`flex items-center gap-2.5 font-serif text-xl font-bold transition-colors ${
            scrolled ? "text-zinc-950 hover:text-[#DC2626]" : "text-white hover:text-white/80"
          }`}
        >
          {ashram.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ashram.logo_url}
              alt={ashram.ashram_name}
              className="h-8 w-8 object-contain rounded-md"
            />
          )}
          {ashram.ashram_name}
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                scrolled ? "text-zinc-600 hover:text-zinc-950" : "text-white/80 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`text-[10px] font-medium hidden sm:block transition-colors ${
              scrolled ? "text-zinc-400 hover:text-zinc-600" : "text-white/40 hover:text-white/70"
            }`}
          >
            Powered by Ashram ↗
          </Link>
          <Link
            href={`/a/${slug}/stay`}
            className="bg-[#DC2626] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#B91C1C] transition-colors"
          >
            Book a Stay
          </Link>
          {/* Mobile menu button */}
          <button
            className={`md:hidden p-1.5 rounded-md transition-colors ${
              scrolled ? "text-zinc-700 hover:bg-zinc-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 px-4 py-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
