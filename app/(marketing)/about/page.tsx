import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the Ashram Management platform — built to modernise how India's spiritual communities operate.",
};

const stats = [
  { value: "500+",  label: "Communities" },
  { value: "50K+",  label: "Devotees Managed" },
  { value: "₹10Cr+", label: "Donations Processed" },
  { value: "10+",  label: "Modules" },
];

const problems = [
  {
    icon: "📊",
    title: "Spreadsheets & Excel",
    desc: "Devotee data, donations, and accounts scattered across multiple Excel files — no single source of truth.",
  },
  {
    icon: "💬",
    title: "WhatsApp & Word of Mouth",
    desc: "Event registrations, room bookings, and seva assignments managed through WhatsApp groups — no records, no accountability.",
  },
  {
    icon: "📋",
    title: "Paper Ledgers",
    desc: "Handwritten accounts, cash envelopes, and paper receipts — no GST compliance, no financial visibility.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1600&q=80"
            alt="Spiritual community"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>
        <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 py-32 md:py-44 text-center">
          <SectionBadge variant="black">About Us</SectionBadge>
          <SectionHeading as="h1" size="4xl" color="white" className="mt-4 mb-6">
            Built for the communities that built India&apos;s spiritual heritage.
          </SectionHeading>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            We believe every Ashram, temple, and spiritual centre deserves the same operational clarity that modern businesses have — without losing the sacred simplicity at their core.
          </p>
        </div>
      </section>

      {/* Mission pull quote */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-100">
        <div className="container mx-auto max-w-3xl">
          <div className="border-l-4 border-[#DC2626] pl-8">
            <blockquote className="font-serif text-2xl md:text-3xl font-bold text-zinc-950 leading-snug mb-4">
              &ldquo;Most Ashram administrators are deeply committed, deeply experienced — but deeply under-resourced when it comes to management tools.&rdquo;
            </blockquote>
            <p className="text-zinc-400 text-sm">— Founding Team, Ashram Management</p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <SectionBadge>The Problem</SectionBadge>
            <SectionHeading>How Ashrams were managing before.</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p) => (
              <div key={p.title} className="bg-white p-8 border border-zinc-100">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">{p.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-[#09090B] p-8 md:p-10">
            <p className="font-serif text-xl md:text-2xl font-bold text-white mb-2">The Solution</p>
            <p className="text-white/60 leading-relaxed">
              A single platform that brings every operation — devotees, donations, events, accounts, accommodation, kitchen, courses, and volunteers — into one unified, intelligent system. Built specifically for the way spiritual institutions work.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-zinc-100">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-4xl md:text-5xl font-bold text-zinc-950 mb-2">{s.value}</div>
                <div className="text-sm text-zinc-400 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionBadge>Our Team</SectionBadge>
              <SectionHeading className="mt-2 mb-6">Built by people who understand both technology and tradition.</SectionHeading>
              <p className="text-zinc-500 leading-relaxed mb-4">
                Ashram Management is built by <strong className="text-zinc-900">Virtual Xcellence</strong>, a technology company passionate about building software for India&apos;s institutions. Our team has worked closely with Ashrams, temples, and spiritual trusts to understand their unique operational challenges.
              </p>
              <p className="text-zinc-500 leading-relaxed mb-8">
                We believe digital tools should serve the mission — not complicate it. Every feature we build is guided by that principle.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors underline underline-offset-4"
              >
                Get in touch with our team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
                alt="Community"
                width={800}
                height={600}
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        variant="black"
        heading="Ready to modernise your Ashram?"
        subheading="Start with our free plan and upgrade as you grow."
        primaryCta={{ label: "Get Started Free", href: "/auth/sign-up" }}
        secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
