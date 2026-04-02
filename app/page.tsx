import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PricingSection } from "@/components/pricing-section";
import {
  Users,
  Heart,
  Calendar,
  BedDouble,
  Wallet,
  BookOpen,
  UtensilsCrossed,
  HandHeart,
  Check,
  ArrowRight,
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Users,
    title: "Devotee Management",
    description:
      "Maintain a complete registry of devotees, families, and relationships. Track engagement, history, and personal milestones.",
  },
  {
    icon: Heart,
    title: "Donations & Receipts",
    description:
      "Record cash and in-kind donations. Auto-generate 80G tax-exempt receipts and maintain full donor history.",
  },
  {
    icon: Calendar,
    title: "Events & Registration",
    description:
      "Create and publish events, manage registrations, track attendance, and send automated confirmations.",
  },
  {
    icon: BedDouble,
    title: "Accommodation",
    description:
      "Manage guest rooms, handle booking requests, track check-ins and check-outs, and view occupancy reports.",
  },
  {
    icon: Wallet,
    title: "Accounting & GST",
    description:
      "Full double-entry accounting with chart of accounts, ledger, P&L, balance sheet, and GST return filing.",
  },
  {
    icon: BookOpen,
    title: "Gurukul & Courses",
    description:
      "Publish study materials and video courses. Students enrol, learn, and track progress in a dedicated portal.",
  },
  {
    icon: UtensilsCrossed,
    title: "Kitchen & Prasad",
    description:
      "Plan meals, track daily Prasad distribution, manage kitchen inventory, and record food-related expenses.",
  },
  {
    icon: HandHeart,
    title: "Seva & Volunteers",
    description:
      "Assign and track Seva duties, manage volunteer availability, and acknowledge contributions automatically.",
  },
];

const steps = [
  {
    number: "01",
    title: "Set up your Ashram profile",
    description:
      "Add your Ashram details, upload logo, configure timezone and GST settings in under 5 minutes.",
  },
  {
    number: "02",
    title: "Invite staff & configure modules",
    description:
      "Assign roles to priests, accountants, and coordinators. Enable only the modules you need.",
  },
  {
    number: "03",
    title: "Manage everything from one dashboard",
    description:
      "All your operations — devotees, donations, events, accounts — unified in a single clean interface.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    inr: "Free",
    usd: "Free",
    period: "",
    description: "For small ashrams getting started.",
    highlight: false,
    features: [
      "Up to 200 devotees",
      "Basic donations & receipts",
      "Event management (2 active)",
      "Community support",
      "1 admin user",
    ],
    cta: "Get Started Free",
    href: "/auth/sign-up",
  },
  {
    name: "Growth",
    inr: "₹2,999",
    usd: "$36",
    period: "/ month",
    description: "For growing ashrams with full operational needs.",
    highlight: true,
    features: [
      "Unlimited devotees",
      "Full accounting & GST",
      "Unlimited events & accommodation",
      "Gurukul & courses",
      "Kitchen & inventory management",
      "Up to 10 staff users",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
  },
  {
    name: "Enterprise",
    inr: "Custom",
    usd: "Custom",
    period: "",
    description: "For large organisations and multi-location Ashrams.",
    highlight: false,
    features: [
      "Everything in Growth",
      "Multi-location support",
      "Custom integrations & API",
      "Dedicated onboarding",
      "Unlimited staff users",
      "SLA & dedicated support",
    ],
    cta: "Contact Us",
    href: "mailto:hello@virtualxcellence.com",
  },
];

const testimonials = [
  {
    initials: "SR",
    name: "Swami Ramananda",
    role: "Head Priest",
    ashram: "Ananda Ashram, Rishikesh",
    quote:
      "Managing hundreds of devotees and events used to take days every week. With Ashram, it now takes hours. The donation receipts alone have saved us enormous compliance headaches.",
  },
  {
    initials: "PD",
    name: "Priya Deshpande",
    role: "Trust Manager",
    ashram: "Shiv Mandir Trust, Pune",
    quote:
      "The accounting module is exactly what a temple needs — GST, tally-compatible exports, and clear financial reports for our trustees. Highly recommended.",
  },
  {
    initials: "AK",
    name: "Acharya Krishnamurthy",
    role: "Founder",
    ashram: "Vedanta Kendra, Coimbatore",
    quote:
      "Our Gurukul went digital with courses and study materials. Students log in from across India. We never thought we'd be able to offer online learning so easily.",
  },
];

const trustBadges = [
  "Ashrams",
  "Temples",
  "Spiritual Centres",
  "Trusts & NGOs",
  "Yoga Institutes",
  "Math & Peethams",
];

/* ─── Components ────────────────────────────────────────────────────────────── */

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border mb-4"
      style={{ borderColor: "rgba(60,2,18,0.25)", color: "#3c0212", backgroundColor: "rgba(60,2,18,0.06)" }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
      style={{ color: "#3c0212" }}
    >
      {children}
    </h2>
  );
}

/* ─── Mock Dashboard UI ─────────────────────────────────────────────────────── */

function DashboardMockup() {
  return (
    <div
      className="w-full bg-[#fef9fb] p-4 text-xs font-mono select-none"
      style={{ border: "1px solid rgba(60,2,18,0.15)" }}
    >
      {/* Titlebar */}
      <div
        className="flex items-center gap-2 mb-4 pb-3 border-b"
        style={{ borderColor: "#3c0212" }}
      >
        <div className="h-2 w-2 rounded-full bg-[#3c0212]" />
        <div className="h-2 w-2 rounded-full bg-[#3c0212] opacity-50" />
        <div className="h-2 w-2 rounded-full bg-[#3c0212] opacity-25" />
        <span className="ml-2 font-serif font-bold text-sm" style={{ color: "#3c0212" }}>
          Ashram Dashboard
        </span>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Devotees", value: "1,248" },
          { label: "Donations", value: "₹3.2L" },
          { label: "Events", value: "14" },
        ].map((s) => (
          <div
            key={s.label}
            className="border p-2"
            style={{ borderColor: "#3c0212" }}
          >
            <div className="text-[10px] opacity-50 uppercase tracking-wide" style={{ color: "#3c0212" }}>
              {s.label}
            </div>
            <div className="font-bold text-base" style={{ color: "#3c0212" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
      {/* Table mock */}
      <div className="border" style={{ borderColor: "#3c0212" }}>
        <div
          className="grid grid-cols-3 gap-0 border-b px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ borderColor: "#3c0212", backgroundColor: "#3c0212", color: "#fef9fb" }}
        >
          <span>Devotee</span>
          <span>Last Visit</span>
          <span>Status</span>
        </div>
        {[
          { name: "Ramesh Iyer", date: "Mar 6", status: "Active" },
          { name: "Meera Nair", date: "Mar 5", status: "Active" },
          { name: "Arjun Pillai", date: "Feb 28", status: "Inactive" },
        ].map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-3 gap-0 px-2 py-1.5 border-b last:border-0 text-[10px]"
            style={{ borderColor: "#3c0212", color: "#3c0212" }}
          >
            <span className="truncate">{row.name}</span>
            <span>{row.date}</span>
            <span
              className={
                row.status === "Active" ? "font-bold" : "opacity-40"
              }
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountingMockup() {
  return (
    <div
      className="w-full bg-[#fef9fb] p-4 text-xs select-none"
      style={{ border: "1px solid rgba(60,2,18,0.15)" }}
    >
      <div
        className="font-serif font-bold mb-3 pb-2 border-b text-sm"
        style={{ borderColor: "#3c0212", color: "#3c0212" }}
      >
        Profit & Loss — March 2026
      </div>
      <div className="space-y-1.5">
        {[
          { label: "Donations", amount: "₹1,24,500", type: "income" },
          { label: "Event Revenue", amount: "₹38,200", type: "income" },
          { label: "Course Sales", amount: "₹22,000", type: "income" },
          { label: "Kitchen Expenses", amount: "−₹18,400", type: "expense" },
          { label: "Staff Salaries", amount: "−₹32,000", type: "expense" },
          { label: "Utilities", amount: "−₹6,800", type: "expense" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex justify-between text-[11px] py-1 border-b"
            style={{ borderColor: "#3c0212", color: "#3c0212" }}
          >
            <span className={item.type === "expense" ? "opacity-60" : ""}>{item.label}</span>
            <span className={`font-mono font-bold ${item.type === "expense" ? "opacity-60" : ""}`}>
              {item.amount}
            </span>
          </div>
        ))}
        <div
          className="flex justify-between text-[12px] pt-2 font-bold"
          style={{ color: "#3c0212" }}
        >
          <span>Net Surplus</span>
          <span className="font-mono">₹1,27,500</span>
        </div>
      </div>
    </div>
  );
}

function GurukukMockup() {
  return (
    <div
      className="w-full bg-[#fef9fb] p-4 text-xs select-none"
      style={{ border: "1px solid rgba(60,2,18,0.15)" }}
    >
      <div
        className="font-serif font-bold mb-3 pb-2 border-b text-sm"
        style={{ borderColor: "#3c0212", color: "#3c0212" }}
      >
        Gurukul — My Learning
      </div>
      {[
        { title: "Bhagavad Gita — Chapter 1 to 6", progress: 60, lessons: "12/20" },
        { title: "Patanjali Yoga Sutras", progress: 30, lessons: "6/20" },
        { title: "Vedantic Philosophy 101", progress: 85, lessons: "17/20" },
      ].map((course) => (
        <div
          key={course.title}
          className="mb-3 pb-3 border-b last:border-0 last:mb-0 last:pb-0"
          style={{ borderColor: "#3c0212" }}
        >
          <div className="font-medium text-[11px] mb-1.5" style={{ color: "#3c0212" }}>
            {course.title}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 border" style={{ borderColor: "#3c0212" }}>
              <div
                className="h-full"
                style={{ width: `${course.progress}%`, backgroundColor: "#3c0212" }}
              />
            </div>
            <span className="text-[10px] opacity-60" style={{ color: "#3c0212" }}>
              {course.lessons} lessons
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fbf9ef" }}>
      <Header />
      <main className="pt-[68px]">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 border-b overflow-hidden" style={{ borderColor: "#3c0212" }}>
        {/* Decorative radial gradient */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(60,2,18,0.06) 0%, transparent 70%)" }} />
        <div className="container mx-auto max-w-7xl relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge
                className="mb-6 rounded-full text-xs font-semibold tracking-widest uppercase px-4 py-1.5 border"
                style={{
                  backgroundColor: "rgba(60,2,18,0.06)",
                  borderColor: "rgba(60,2,18,0.25)",
                  color: "#3c0212",
                }}
              >
                All-in-one Ashram Platform
              </Badge>
              <h1
                className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6"
                style={{ color: "#3c0212" }}
              >
                Complete Management Platform for Your Ashram
              </h1>
              <p
                className="text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
                style={{ color: "#3c0212", opacity: 0.72 }}
              >
                From devotees and donations to events, accounts, and courses — everything your Ashram needs to operate efficiently, all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-lg font-semibold text-base px-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                  style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                >
                  <Link href="/auth/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-lg font-semibold text-base px-8 border-2 transition-all duration-200 hover:bg-[#3c0212]/5"
                  style={{ borderColor: "#3c0212", color: "#3c0212", backgroundColor: "transparent" }}
                >
                  <Link href="/events">View Events</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm" style={{ color: "#3c0212", opacity: 0.5 }}>
                No credit card required &middot; Free forever plan available
              </p>
            </div>
            <div className="lg:pl-8">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 25px 60px rgba(60,2,18,0.18)" }}>
                <DashboardMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAR ───────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "#3c0212" }}>
        <div className="container mx-auto max-w-7xl">
          <p
            className="text-center text-xs font-semibold tracking-widest uppercase mb-6"
            style={{ color: "#3c0212", opacity: 0.45 }}
          >
            Trusted by ashrams, temples &amp; spiritual centres worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium px-4 py-1.5 rounded-full border"
                style={{ borderColor: "rgba(60,2,18,0.3)", color: "#3c0212", backgroundColor: "rgba(60,2,18,0.04)" }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "#3c0212" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <SectionBadge>Features</SectionBadge>
            <SectionHeading>Everything you need to run your Ashram</SectionHeading>
            <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: "#3c0212", opacity: 0.65 }}>
              Purpose-built modules for every aspect of Ashram operations. Start with one, activate more as you grow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 bg-[#fef9fb] rounded-xl border transition-all duration-200 hover:-translate-y-1 cursor-default"
                  style={{ borderColor: "rgba(60,2,18,0.15)", boxShadow: "0 2px 8px rgba(60,2,18,0.06)" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(60,2,18,0.14)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(60,2,18,0.06)")}
                >
                  <div className="mb-4 p-2.5 rounded-lg inline-flex items-center justify-center transition-colors duration-200" style={{ backgroundColor: "rgba(60,2,18,0.08)" }}>
                    <Icon className="h-5 w-5" style={{ color: "#3c0212" }} />
                  </div>
                  <h3
                    className="font-serif text-lg font-bold mb-2"
                    style={{ color: "#3c0212" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#3c0212", opacity: 0.65 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b"
        style={{ backgroundColor: "#3c0212", borderColor: "#3c0212" }}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border mb-4"
              style={{ borderColor: "rgba(254,249,251,0.3)", color: "#fef9fb", backgroundColor: "rgba(254,249,251,0.1)" }}
            >
              How It Works
            </span>
            <h2
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold"
              style={{ color: "#fef9fb" }}
            >
              Up and running in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="p-8 md:p-10 rounded-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(254,249,251,0.15)" }}
              >
                <div
                  className="font-serif text-6xl font-bold mb-4 leading-none"
                  style={{ color: "#fef9fb", opacity: 0.2 }}
                >
                  {step.number}
                </div>
                <h3
                  className="font-serif text-xl font-bold mb-3"
                  style={{ color: "#fef9fb" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#fef9fb", opacity: 0.7 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. FEATURE SPOTLIGHT — Accounting ──────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "#3c0212" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionBadge>Accounting & Finance</SectionBadge>
              <SectionHeading>Complete financial control — built for Indian compliance</SectionHeading>
              <p className="mt-4 mb-6 text-base leading-relaxed" style={{ color: "#3c0212", opacity: 0.65 }}>
                Double-entry bookkeeping, GST filing, bank reconciliation, and full financial reports trusted by Ashram trustees and auditors.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Chart of accounts, ledger & journal entries",
                  "GST returns (GSTR-1, 3B) and reports",
                  "Bank reconciliation & multiple accounts",
                  "P&L, Balance Sheet & Cash Flow statements",
                  "Vendor management & bills payable",
                  "80G donation receipts & tally-ready exports",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#3c0212" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#3c0212" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="rounded-none font-semibold border-2"
                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
              >
                <Link href="/auth/sign-up">
                  Explore Accounting <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="lg:pl-8">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(60,2,18,0.14)" }}>
                <AccountingMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FEATURE SPOTLIGHT — Gurukul ─────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "#3c0212", backgroundColor: "#fef9fb" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 lg:pr-8">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(60,2,18,0.14)" }}>
                <GurukukMockup />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionBadge>Gurukul & Learning</SectionBadge>
              <SectionHeading>Bring your teachings online — reach devotees everywhere</SectionHeading>
              <p className="mt-4 mb-6 text-base leading-relaxed" style={{ color: "#3c0212", opacity: 0.65 }}>
                Publish video courses and study materials. Students enrol, track progress, and access content from any device.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Course builder with lessons and video content",
                  "Study materials — PDFs, audio, and documents",
                  "Student portal with progress tracking",
                  "Order management for paid courses",
                  "Role-based access: admin vs student view",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#3c0212" }}>
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#3c0212" }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="rounded-none font-semibold"
                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
              >
                <Link href="/gurukul">
                  Browse Gurukul Store <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. PRICING ──────────────────────────────────────────────────────── */}
      <PricingSection plans={pricingPlans} />

      {/* ── 8. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "#3c0212", backgroundColor: "#fef9fb" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <SectionBadge>Testimonials</SectionBadge>
            <SectionHeading>Trusted by spiritual communities</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 flex flex-col rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderColor: "rgba(60,2,18,0.15)", backgroundColor: "#fef9fb", boxShadow: "0 2px 12px rgba(60,2,18,0.07)" }}
              >
                <div className="text-4xl font-serif mb-4 leading-none" style={{ color: "#3c0212", opacity: 0.2 }}>&ldquo;</div>
                <p
                  className="text-sm leading-relaxed mb-8 flex-1"
                  style={{ color: "#3c0212", opacity: 0.8 }}
                >
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full font-serif font-bold text-sm"
                    style={{ backgroundColor: "rgba(60,2,18,0.1)", color: "#3c0212" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#3c0212" }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: "#3c0212", opacity: 0.55 }}>
                      {t.role}, {t.ashram}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA BANNER ───────────────────────────────────────────────────── */}
      <section
        className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{ backgroundColor: "#3c0212" }}
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,200,180,0.08) 0%, transparent 70%)" }} />
        <div className="container mx-auto max-w-3xl text-center relative">
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{ color: "#fef9fb" }}
          >
            Ready to modernise your Ashram?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "#fef9fb", opacity: 0.7 }}>
            Join hundreds of Ashrams and temples already using the platform. Start your free trial — no card needed.
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-lg font-semibold text-base px-10 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: "#fef9fb", color: "#3c0212" }}
          >
            <Link href="/auth/sign-up">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-6 text-sm" style={{ color: "#fef9fb", opacity: 0.45 }}>
            No credit card required &middot; Free plan available forever
          </p>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}
