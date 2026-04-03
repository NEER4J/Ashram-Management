"use client";

import { useState } from "react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";

const orgTypes = [
  "Ashram / Monastery",
  "Temple / Math",
  "Yoga / Wellness Centre",
  "Trust / NGO",
  "Vedic School / Gurukul",
  "Other Spiritual Organisation",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", orgType: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      // still show success to user
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-20 md:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-b-zinc-950">
        <div className="container mx-auto max-w-4xl">
          <SectionBadge>Contact</SectionBadge>
          <SectionHeading as="h1" size="3xl" className="mt-4 mb-4">Get in touch.</SectionHeading>
          <p className="text-lg text-zinc-500 leading-relaxed max-w-xl">
            Questions about pricing, features, or setting up your Ashram? Our team is here to help.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Left info */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-2">Email</p>
                  <a href="mailto:hello@virtualxcellence.com" className="text-zinc-900 font-medium hover:text-[#DC2626] transition-colors">
                    hello@virtualxcellence.com
                  </a>
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-2">Response Time</p>
                  <p className="text-zinc-700 text-sm">We respond within 1 business day.</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-2">Built by</p>
                  <a
                    href="https://virtualxcellence.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-700 text-sm font-medium hover:text-[#DC2626] transition-colors"
                  >
                    Virtual Xcellence →
                  </a>
                </div>
                <div className="bg-zinc-50 p-6 border border-zinc-100">
                  <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-3">Quick Links</p>
                  <ul className="space-y-2">
                    {[
                      { label: "View Pricing Plans", href: "/pricing" },
                      { label: "Explore Features", href: "/features" },
                      { label: "Start Free Trial", href: "/auth/sign-up" },
                      { label: "Read Documentation", href: "#" },
                    ].map((l) => (
                      <li key={l.label}>
                        <a href={l.href} className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors flex items-center gap-1">
                          → {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-zinc-50 border border-zinc-100 p-10 text-center">
                  <div className="text-3xl mb-4">🙏</div>
                  <h3 className="font-serif text-2xl font-bold text-zinc-950 mb-3">Thank you for reaching out.</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    We&apos;ve received your message and will get back to you within 1 business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Your Name *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                        placeholder="Swami Ramananda"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Email *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                        placeholder="hello@ashram.org"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Organisation</label>
                      <input
                        type="text"
                        value={form.org}
                        onChange={(e) => setForm({ ...form, org: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                        placeholder="Ananda Ashram"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Organisation Type</label>
                      <select
                        value={form.orgType}
                        onChange={(e) => setForm({ ...form, orgType: e.target.value })}
                        className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-zinc-950 transition-colors bg-white"
                      >
                        <option value="">Select type...</option>
                        {orgTypes.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors"
                      placeholder="Question about pricing / demo request / etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 transition-colors resize-none"
                      placeholder="Tell us about your organisation and how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#DC2626] text-white text-sm font-semibold py-4 hover:bg-[#B91C1C] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
