"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";

const solutions = [
  {
    id: "ashrams",
    label: "Ashrams",
    title: "Built for Ashrams & Monasteries",
    description: "From sadhana retreats to permanent residential communities — manage every aspect of ashram life with one platform.",
    img: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
    painPoints: [
      "Tracking hundreds of resident devotees across seasons",
      "Managing accommodation bookings and seva assignments",
      "Maintaining GST-compliant accounts and 80G receipts",
      "Running courses, retreats, and satsangs simultaneously",
    ],
    modules: ["Devotee Management", "Accommodation", "Seva & Volunteers", "Accounting & GST", "Events", "Kitchen & Prasad"],
    quote: "We now manage 400 residents, 50 staff, and ₹2Cr in annual donations from a single dashboard.",
    quoteName: "Swami Ramananda, Ananda Ashram",
  },
  {
    id: "temples",
    label: "Temples",
    title: "Purpose-built for Temples & Math",
    description: "Puja bookings, festival events, donation receipts, and priest management — everything a temple needs to run smoothly.",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=70",
    painPoints: [
      "Managing puja booking queues and scheduling priests",
      "Issuing donation receipts for festivals with thousands of donors",
      "Tracking festival inventory and Prasad distribution",
      "Handling visitor rush during major festivals",
    ],
    modules: ["Puja Booking", "Devotee Management", "Donations & Receipts", "Events", "Inventory", "Visitor Management"],
    quote: "During Navratri, we registered 3,000 devotees and issued receipts to all. Earlier this would take a week.",
    quoteName: "Priya Deshpande, Shiv Mandir Trust",
  },
  {
    id: "yoga",
    label: "Yoga Institutes",
    title: "Ideal for Yoga & Wellness Centres",
    description: "Publish courses, manage student enrolments, track fees, and run online programs — all in one platform.",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    painPoints: [
      "Managing course enrolments and student progress manually",
      "Collecting fees and issuing receipts for multiple batches",
      "Sharing study materials and video content with students",
      "Running in-person and online courses simultaneously",
    ],
    modules: ["Gurukul & Courses", "Devotee Management", "Donations & Fees", "Events", "Accommodation"],
    quote: "Our students from 12 countries now access all our video courses and materials from one portal.",
    quoteName: "Acharya Krishnamurthy, Vedanta Kendra",
  },
  {
    id: "trusts",
    label: "Trusts & NGOs",
    title: "Designed for Trusts & NGOs",
    description: "80G receipts, full double-entry accounts, GST compliance, and donor management — built for the accountability trusts need.",
    img: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
    painPoints: [
      "Maintaining auditable accounts for trust board reporting",
      "Issuing 80G receipts and managing donor records",
      "FCRA and GST compliance across multiple activities",
      "Tracking project-wise expenses and budgets",
    ],
    modules: ["Accounting & GST", "Donations & Receipts", "Budgets", "Reports", "Volunteers", "Events"],
    quote: "Our annual audit now takes 2 days instead of 2 weeks. The accounts are always up to date.",
    quoteName: "Mehul Shah, Dharma Seva Trust",
  },
  {
    id: "vedic",
    label: "Vedic Schools",
    title: "Tailored for Vedic Schools & Gurukuls",
    description: "Manage students, courses, residential facilities, and traditional learning programs — in one unified platform.",
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    painPoints: [
      "Tracking student progress across multiple subjects and gurus",
      "Managing residential facilities for live-in students",
      "Publishing digital study materials alongside traditional teaching",
      "Collecting fees and managing student records",
    ],
    modules: ["Gurukul & Courses", "Devotee/Student Management", "Accommodation", "Kitchen & Prasad", "Accounting"],
    quote: "We now run a hybrid Gurukul — traditional teaching in the morning, digital resources in the evening.",
    quoteName: "Pandit Vasudevan, Vedic Gurukul",
  },
];

export default function SolutionsPage() {
  const [active, setActive] = useState(solutions[0].id);
  const current = solutions.find((s) => s.id === active)!;

  return (
    <>
      {/* Hero */}
      <section className="bg-[#DC2626] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionBadge variant="black">Solutions</SectionBadge>
          <SectionHeading as="h1" size="4xl" color="white" className="mt-4 mb-6">
            The right solution for your community.
          </SectionHeading>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Whether you run a small Ashram or a multi-location trust, the platform adapts to your specific needs. Pick your organisation type below.
          </p>
        </div>
      </section>

      {/* Tab selector */}
      <div className="sticky top-[68px] z-30 bg-white border-b border-zinc-200 overflow-x-auto">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-0">
            {solutions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  active === s.id
                    ? "border-[#DC2626] text-[#DC2626]"
                    : "border-transparent text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Solution content */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <SectionBadge>{current.label}</SectionBadge>
              <SectionHeading className="mt-2 mb-4">{current.title}</SectionHeading>
              <p className="text-zinc-500 leading-relaxed mb-8">{current.description}</p>

              <div className="mb-8">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-zinc-400 mb-4">Common pain points we solve</p>
                <ul className="space-y-3">
                  {current.painPoints.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-zinc-700">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-zinc-400 mb-4">Recommended modules</p>
                <div className="flex flex-wrap gap-2">
                  {current.modules.map((m) => (
                    <span key={m} className="text-xs font-medium px-3 py-1.5 border border-zinc-200 text-zinc-600">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="bg-zinc-50 border-l-4 border-[#DC2626] p-6">
                <p className="text-sm text-zinc-700 italic leading-relaxed mb-3">&ldquo;{current.quote}&rdquo;</p>
                <p className="text-xs text-zinc-400 font-semibold">— {current.quoteName}</p>
              </div>

              <div className="mt-8 flex gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#DC2626] text-white text-sm font-semibold hover:bg-[#B91C1C] transition-colors"
                >
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-zinc-900 text-zinc-900 text-sm font-semibold hover:bg-zinc-900 hover:text-white transition-colors"
                >
                  Talk to Us
                </Link>
              </div>
            </div>

            <div className="relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
              <Image
                src={current.img}
                alt={current.title}
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
        heading="Not sure which plan fits?"
        subheading="Talk to our team — we'll help you find the right setup for your community."
        primaryCta={{ label: "Contact Us", href: "/contact" }}
        secondaryCta={{ label: "View Pricing", href: "/pricing" }}
      />
    </>
  );
}
