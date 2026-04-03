import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Play } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { TrustBar } from "@/components/marketing/trust-bar";

/* ─── Data ─────────────────────────────────────────────────────────────────── */

const features = [
  { icon: "👥", title: "Devotee Management",   description: "Complete registry with families, relationships, and engagement tracking." },
  { icon: "💰", title: "Donations & Receipts", description: "80G tax-exempt receipts, donor history, and in-kind donation records." },
  { icon: "📅", title: "Events & Registration", description: "Publish events, manage registrations, QR check-in, and attendance." },
  { icon: "🛏️", title: "Accommodation",        description: "Guest rooms, booking management, check-in/out, and occupancy reports." },
  { icon: "📊", title: "Accounting & GST",     description: "Double-entry bookkeeping, GSTR filing, P&L, and Balance Sheet." },
  { icon: "📚", title: "Gurukul & Courses",    description: "Video courses, study materials, and a student portal with progress tracking." },
  { icon: "🍽️", title: "Kitchen & Prasad",    description: "Meal planning, Prasad distribution, kitchen inventory, and Annadaan." },
  { icon: "🙏", title: "Seva & Volunteers",    description: "Assign seva duties, manage volunteers, track shifts, and award badges." },
];

const steps = [
  { number: "01", title: "Set up your Ashram profile", description: "Add your Ashram details, upload logo, configure timezone and GST settings in under 5 minutes." },
  { number: "02", title: "Invite staff & configure modules", description: "Assign roles to priests, accountants, and coordinators. Enable only the modules you need." },
  { number: "03", title: "Manage everything from one dashboard", description: "All your operations — devotees, donations, events, accounts — unified in a single clean interface." },
];

const testimonials = [
  {
    initials: "SR",
    name: "Swami Ramananda",
    role: "Head Priest",
    ashram: "Ananda Ashram, Rishikesh",
    quote: "Managing hundreds of devotees and events used to take days every week. With Ashram, it now takes hours. The donation receipts alone have saved us enormous compliance headaches.",
  },
  {
    initials: "PD",
    name: "Priya Deshpande",
    role: "Trust Manager",
    ashram: "Shiv Mandir Trust, Pune",
    quote: "The accounting module is exactly what a temple needs — GST, tally-compatible exports, and clear financial reports for our trustees. Highly recommended.",
  },
  {
    initials: "AK",
    name: "Acharya Krishnamurthy",
    role: "Founder",
    ashram: "Vedanta Kendra, Coimbatore",
    quote: "Our Gurukul went digital with courses and study materials. Students log in from across India. We never thought we'd be able to offer online learning so easily.",
  },
];

const solutionCards = [
  {
    title: "Ashrams & Monasteries",
    desc: "Full operations: devotees, donations, accommodation, kitchen, and accounts.",
    href: "/solutions#ashrams",
    img: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=70",
  },
  {
    title: "Temples & Math",
    desc: "Event management, puja bookings, inventory, and GST compliance built in.",
    href: "/solutions#temples",
    img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=70",
  },
  {
    title: "Yoga & Wellness Centres",
    desc: "Course publishing, student management, and seamless fee collection.",
    href: "/solutions#yoga",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For small ashrams getting started.",
    highlight: false,
    features: ["Up to 200 devotees", "Basic donations & receipts", "2 active events", "Community support", "1 admin user"],
    cta: "Get Started Free",
    href: "/auth/sign-up",
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/ month",
    description: "For growing ashrams with full operational needs.",
    highlight: true,
    features: ["Unlimited devotees", "Full accounting & GST", "Unlimited events", "Gurukul & courses", "Kitchen & inventory", "Up to 10 staff users", "Priority support"],
    cta: "Start Free Trial",
    href: "/auth/sign-up",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations and multi-location Ashrams.",
    highlight: false,
    features: ["Everything in Growth", "Multi-location support", "Custom integrations", "Dedicated onboarding", "Unlimited staff users", "SLA & dedicated support"],
    cta: "Contact Us",
    href: "/contact",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="relative border-b border-zinc-100 py-20 md:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase px-3 py-1 border border-[#DC2626]/30 text-[#DC2626] bg-[#DC2626]/5 rounded-full mb-6">
                All-in-one Ashram Platform
              </span>
              <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-950 leading-[1.05] tracking-tight mb-6">
                The operating system for India&apos;s spiritual communities.
              </h1>
              <p className="text-lg md:text-xl text-zinc-500 leading-relaxed mb-8 max-w-2xl">
                Devotees, donations, events, accounts, courses — unified in a single intelligent platform. Built for Ashrams, temples, and trusts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#DC2626] text-white font-semibold text-base hover:bg-[#B91C1C] transition-colors rounded-xl"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-zinc-200 text-zinc-700 font-semibold text-base hover:border-zinc-400 hover:bg-zinc-50 transition-colors rounded-xl"
                >
                  <Play className="h-4 w-4" /> See All Features
                </Link>
              </div>
              <p className="text-sm text-zinc-400">Free forever plan · No credit card · Setup in 5 minutes</p>
            </div>

            {/* Right — hero image */}
            <div className="lg:col-span-2 relative">
              <div className="relative overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.18)] rounded-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80"
                  alt="Ashram temple"
                  width={800}
                  height={900}
                  className="w-full object-cover aspect-[4/5]"
                  priority
                />
                {/* Stats overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 shadow-soft-lg border border-zinc-100 rounded-xl">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "1,248", label: "Devotees" },
                      { value: "₹3.2L", label: "Donations" },
                      { value: "14",    label: "Events" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="font-serif text-xl font-bold text-zinc-950">{s.value}</div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wide">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. TRUST BAR ────────────────────────────────────────────────────── */}
      <TrustBar />

      {/* ── 3. FEATURE GRID ─────────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b-4 border-b-zinc-950">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-14 max-w-2xl">
            <SectionBadge>Everything you need</SectionBadge>
            <SectionHeading>One platform.<br />Every operation.</SectionHeading>
            <p className="mt-4 text-base md:text-lg text-zinc-500 leading-relaxed">
              Purpose-built modules for every aspect of Ashram operations. Start with one, activate more as you grow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 bg-white border border-zinc-100 hover:border-zinc-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default rounded-xl"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-lg font-bold text-zinc-950 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/features"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors underline underline-offset-4"
            >
              Explore all features in detail <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. SPOTLIGHT — Accounting (black bg) ────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionBadge variant="red-filled">Accounting & Finance</SectionBadge>
              <SectionHeading color="white" className="mt-2 mb-6">
                Financial compliance built for Indian Ashrams.
              </SectionHeading>
              <p className="text-white/60 leading-relaxed mb-8">
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
                  <li key={item} className="flex items-start gap-3 text-sm text-white/75">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/features#accounting"
                className="inline-flex items-center gap-2 border border-white/30 text-white text-sm font-semibold px-6 py-3 hover:border-white hover:bg-white/5 transition-colors rounded-xl"
              >
                Explore Accounting <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              {/* Accounting mockup — dark palette */}
              <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                <div className="font-serif font-bold text-white text-sm mb-4 pb-3 border-b border-white/10">
                  Profit & Loss — March 2026
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Donations",        amount: "₹1,24,500", type: "income" },
                    { label: "Event Revenue",    amount: "₹38,200",   type: "income" },
                    { label: "Course Sales",     amount: "₹22,000",   type: "income" },
                    { label: "Kitchen Expenses", amount: "−₹18,400",  type: "expense" },
                    { label: "Staff Salaries",   amount: "−₹32,000",  type: "expense" },
                    { label: "Utilities",        amount: "−₹6,800",   type: "expense" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs py-1.5 border-b border-white/5">
                      <span className={row.type === "expense" ? "text-white/40" : "text-white/75"}>{row.label}</span>
                      <span className={`font-mono font-bold ${row.type === "expense" ? "text-white/40" : "text-white/90"}`}>{row.amount}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-3 text-white">
                    <span>Net Surplus</span>
                    <span className="font-mono text-[#DC2626]">₹1,27,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t-4 border-t-[#DC2626]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <SectionBadge>How It Works</SectionBadge>
            <SectionHeading>Up and running in minutes.</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-0 relative">
            <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px border-t-2 border-dashed border-[#DC2626]/30" />
            {steps.map((step, i) => (
              <div key={step.number} className={`p-8 md:p-10 ${i < 2 ? "md:border-r border-zinc-100" : ""}`}>
                <div className="font-serif text-[120px] font-bold leading-none text-zinc-100 select-none mb-4 -mt-6">
                  {step.number}
                </div>
                <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SPOTLIGHT — Gurukul ───────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-zinc-100">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
                alt="Gurukul learning"
                width={800}
                height={600}
                className="w-full object-cover aspect-[4/3]"
              />
            </div>
            <div>
              <SectionBadge>Gurukul & Learning</SectionBadge>
              <SectionHeading className="mt-2 mb-6">Bring your teachings online.</SectionHeading>
              <p className="text-zinc-500 leading-relaxed mb-8">
                Publish video courses and study materials. Students enrol, track progress, and access content from any device — across India and the world.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Course builder with lessons and video content",
                  "Study materials — PDFs, audio, and documents",
                  "Student portal with progress tracking",
                  "Order management for paid courses",
                  "Role-based access: admin vs student view",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                    <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/gurukul"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
              >
                Browse Gurukul Store <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. SOLUTIONS SHOWCASE ────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-100">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-12">
            <SectionBadge>Solutions</SectionBadge>
            <SectionHeading>Built for every spiritual organisation.</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {solutionCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden block aspect-[4/5] md:aspect-[3/4] rounded-2xl"
              >
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-4">{card.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] group-hover:gap-3 transition-all">
                    See how it works <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-y border-zinc-100">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <SectionBadge>Pricing</SectionBadge>
            <SectionHeading>Simple pricing for every stage of growth.</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 flex flex-col rounded-2xl ${
                  plan.highlight
                    ? "bg-[#09090B] text-white shadow-[0_24px_60px_rgba(0,0,0,0.25)]"
                    : "bg-white border border-zinc-100"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 bg-[#DC2626] text-white w-fit mb-4 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${plan.highlight ? "text-white/50" : "text-zinc-400"}`}>
                  {plan.name}
                </div>
                <div className={`font-serif text-4xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-zinc-950"}`}>
                  {plan.price}
                </div>
                {plan.period && (
                  <div className={`text-sm mb-4 ${plan.highlight ? "text-white/50" : "text-zinc-400"}`}>{plan.period}</div>
                )}
                <p className={`text-sm leading-relaxed mb-6 ${plan.highlight ? "text-white/60" : "text-zinc-500"}`}>
                  {plan.description}
                </p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? "text-white/80" : "text-zinc-600"}`}>
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#DC2626]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center text-sm font-semibold py-3 transition-colors rounded-xl ${
                    plan.highlight
                      ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                      : "border-2 border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <SectionBadge variant="black">Testimonials</SectionBadge>
            <SectionHeading color="white">Trusted by spiritual communities.</SectionHeading>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. CTA BANNER ───────────────────────────────────────────────────── */}
      <CtaBanner
        variant="red"
        heading="Ready to modernise your Ashram?"
        subheading="Join hundreds of Ashrams and temples already using the platform. Start your free trial — no card needed."
        primaryCta={{ label: "Get Started Free", href: "/auth/sign-up" }}
        secondaryCta={{ label: "Talk to us", href: "/contact" }}
      />
    </>
  );
}
