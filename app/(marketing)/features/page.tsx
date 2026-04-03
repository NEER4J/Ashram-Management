import Image from "next/image";
import { Check } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features",
  description: "Every feature your Ashram needs — devotees, donations, events, accounting, Gurukul, kitchen, seva, accommodation, inventory, and medical.",
};

const modules = [
  {
    id: "devotees",
    badge: "Core",
    title: "Devotee Management",
    description: "Maintain a complete, searchable registry of devotees, their families, and relationships. Track engagement history, personal milestones, and communication preferences.",
    features: [
      "Complete devotee profiles with photos and family trees",
      "Relationship mapping — spouse, children, parents",
      "Engagement history and visit tracking",
      "Search and filter by name, city, or relationship",
      "Bulk import from Excel / CSV",
      "Export and print devotee directory",
    ],
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    flip: false,
  },
  {
    id: "donations",
    badge: "Finance",
    title: "Donations & Receipts",
    description: "Record cash and in-kind donations, auto-generate 80G tax-exempt receipts, and maintain full donor history — all compliant with Indian charity regulations.",
    features: [
      "Cash, cheque, UPI, and bank transfer donations",
      "In-kind donations with valuation tracking",
      "Auto-generate 80G PDF receipts instantly",
      "Donor history and giving trends",
      "Recurring donor tracking",
      "Export donation reports for audits",
    ],
    img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
    flip: true,
  },
  {
    id: "events",
    badge: "Core",
    title: "Events & Registration",
    description: "Create and publish events, collect registrations, generate QR codes for check-in, and track attendance — all from one dashboard.",
    features: [
      "Dynamic event creation with custom fields",
      "Online registration with confirmation emails",
      "QR code generation for each attendee",
      "Live QR scan check-in at the venue",
      "Event analytics — registrations, attendance rate",
      "Event listing public page for each ashram",
    ],
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    flip: false,
  },
  {
    id: "accommodation",
    badge: "Operations",
    title: "Accommodation",
    description: "Manage guest rooms and dharamshalas. Handle booking requests, track check-ins and check-outs, and view real-time occupancy.",
    features: [
      "Property and room management",
      "Guest booking requests with approval flow",
      "Check-in / check-out tracking",
      "Occupancy reports and availability calendar",
      "Waitlist management for fully booked periods",
      "Online public booking page per ashram",
    ],
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
    flip: true,
  },
  {
    id: "accounting",
    badge: "Finance",
    title: "Accounting & GST",
    description: "Full double-entry accounting with chart of accounts, general ledger, and GST return filing. Trusted by ashram trustees and auditors across India.",
    features: [
      "Chart of accounts and general ledger",
      "Journal entries and bank reconciliation",
      "GSTR-1 and GSTR-3B filing support",
      "P&L, Balance Sheet, Cash Flow, Trial Balance",
      "Vendor management and bills payable",
      "Tally-compatible export",
    ],
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    flip: false,
  },
  {
    id: "gurukul",
    badge: "Education",
    title: "Gurukul & Courses",
    description: "Build and publish online courses with video lessons and study materials. Students enrol, learn at their pace, and track progress in a dedicated portal.",
    features: [
      "Course builder with modules and lessons",
      "Video embed support (YouTube, Vimeo, upload)",
      "PDF, audio, and document materials",
      "Student progress tracking per lesson",
      "Paid and free course options",
      "Order management and receipts",
    ],
    img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    flip: true,
  },
  {
    id: "kitchen",
    badge: "Operations",
    title: "Kitchen & Prasad",
    description: "Plan daily meals, track Prasad distribution, manage kitchen inventory, and record food-related expenses and Annadaan activities.",
    features: [
      "Daily meal planning and scheduling",
      "Kitchen inventory tracking",
      "Prasad booking and distribution",
      "Meal token system for large gatherings",
      "Annadaan (free food) tracking",
      "Kitchen expense recording",
    ],
    img: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    flip: false,
  },
  {
    id: "seva",
    badge: "Community",
    title: "Seva & Volunteers",
    description: "Assign seva duties, manage volunteer availability and shifts, track contributions, and automatically award achievement badges.",
    features: [
      "Volunteer profiles and skill tracking",
      "Seva opportunity listings",
      "Shift scheduling and assignments",
      "Volunteer hours tracking",
      "Automatic badge awards for milestones",
      "Volunteer appreciation reports",
    ],
    img: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
    flip: true,
  },
  {
    id: "inventory",
    badge: "Operations",
    title: "Inventory Management",
    description: "Track all physical items — from religious articles to fixed assets. Manage stock levels, purchase orders, location transfers, and low stock alerts.",
    features: [
      "Item catalogue with categories",
      "Stock level tracking with min-stock alerts",
      "Purchase order management",
      "Stock transfer between locations",
      "Religious items and festival inventory",
      "Fixed asset register",
    ],
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    flip: false,
  },
  {
    id: "medical",
    badge: "Welfare",
    title: "Medical & Wellness",
    description: "Manage emergency contacts, log medical camps, track resident wellness records, and maintain first-aid incident logs.",
    features: [
      "Emergency contact directory",
      "Medical camp scheduling and records",
      "Resident wellness tracking",
      "First-aid incident log",
      "Health alerts and notifications",
      "Medical history per devotee/resident",
    ],
    img: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
    flip: true,
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#09090B] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <SectionBadge variant="black">Platform Features</SectionBadge>
          <SectionHeading as="h1" size="4xl" color="white" className="mt-4 mb-6">
            Every feature your Ashram needs.
          </SectionHeading>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            10 purpose-built modules covering every operation — from devotee registry to GST returns. Start with one, activate more as you grow.
          </p>
        </div>
      </section>

      {/* Module nav */}
      <div className="sticky top-[68px] z-30 bg-white border-b border-zinc-100 overflow-x-auto">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-0">
            {modules.map((m) => (
              <a
                key={m.id}
                href={`#${m.id}`}
                className="flex-shrink-0 px-4 py-3.5 text-xs font-semibold text-zinc-500 hover:text-zinc-950 border-b-2 border-transparent hover:border-[#DC2626] transition-all whitespace-nowrap"
              >
                {m.title.split(" ")[0]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      {modules.map((mod, i) => (
        <section
          key={mod.id}
          id={mod.id}
          className={`py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}
        >
          <div className="container mx-auto max-w-7xl">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${mod.flip ? "lg:flex-row-reverse" : ""}`}>
              <div className={mod.flip ? "lg:order-2" : ""}>
                <SectionBadge>{mod.badge}</SectionBadge>
                <SectionHeading className="mt-2 mb-4">{mod.title}</SectionHeading>
                <p className="text-zinc-500 leading-relaxed mb-8">{mod.description}</p>
                <ul className="space-y-2.5">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-700">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`relative overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.1)] ${mod.flip ? "lg:order-1" : ""}`}>
                <Image
                  src={mod.img}
                  alt={mod.title}
                  width={800}
                  height={540}
                  className="w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      <CtaBanner
        variant="red"
        heading="All 10 modules. One platform."
        subheading="Start free and unlock everything you need as your community grows."
        primaryCta={{ label: "Start Free Trial", href: "/auth/sign-up" }}
        secondaryCta={{ label: "Compare Plans", href: "/pricing" }}
      />
    </>
  );
}
