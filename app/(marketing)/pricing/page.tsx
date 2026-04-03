import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { CtaBanner } from "@/components/marketing/cta-banner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for Ashrams of every size. Free forever plan available.",
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "For small ashrams just getting started with digital management.",
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
    features: ["Unlimited devotees", "Full accounting & GST", "Unlimited events & accommodation", "Gurukul & courses", "Kitchen & inventory", "Up to 10 staff users", "Priority email support"],
    cta: "Start 14-Day Free Trial",
    href: "/auth/sign-up",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations, multi-location ashrams, and special requirements.",
    highlight: false,
    features: ["Everything in Growth", "Multi-location support", "Custom integrations & API", "Dedicated onboarding", "Unlimited staff users", "SLA & dedicated support"],
    cta: "Contact Us",
    href: "/contact",
  },
];

const comparisonRows: { feature: string; starter: boolean | string; growth: boolean | string; enterprise: boolean | string }[] = [
  { feature: "Devotees", starter: "Up to 200", growth: "Unlimited", enterprise: "Unlimited" },
  { feature: "Admin Users", starter: "1", growth: "10", enterprise: "Unlimited" },
  { feature: "Donations & Receipts", starter: true, growth: true, enterprise: true },
  { feature: "80G PDF Receipts", starter: true, growth: true, enterprise: true },
  { feature: "Events", starter: "2 active", growth: "Unlimited", enterprise: "Unlimited" },
  { feature: "Event Registration & QR", starter: false, growth: true, enterprise: true },
  { feature: "Accommodation Booking", starter: false, growth: true, enterprise: true },
  { feature: "Accounting (Double-entry)", starter: false, growth: true, enterprise: true },
  { feature: "GST Management", starter: false, growth: true, enterprise: true },
  { feature: "Financial Reports", starter: false, growth: true, enterprise: true },
  { feature: "Gurukul & Courses", starter: false, growth: true, enterprise: true },
  { feature: "Kitchen & Prasad", starter: false, growth: true, enterprise: true },
  { feature: "Inventory Management", starter: false, growth: true, enterprise: true },
  { feature: "Seva & Volunteers", starter: false, growth: true, enterprise: true },
  { feature: "Medical Module", starter: false, growth: true, enterprise: true },
  { feature: "Multi-location Support", starter: false, growth: false, enterprise: true },
  { feature: "Custom Integrations / API", starter: false, growth: false, enterprise: true },
  { feature: "Dedicated Onboarding", starter: false, growth: false, enterprise: true },
  { feature: "Support", starter: "Community", growth: "Priority Email", enterprise: "Dedicated SLA" },
];

const faqs = [
  {
    q: "Is there really a free plan forever?",
    a: "Yes. The Starter plan is completely free with no time limit. It supports up to 200 devotees, basic donations, and 2 active events. You only upgrade when you need more.",
  },
  {
    q: "Can I try Growth features before paying?",
    a: "Yes — we offer a 14-day free trial of the Growth plan. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI, bank transfer (NEFT/IMPS), debit/credit cards, and cheque for annual plans.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. Monthly plans can be cancelled any time. There are no lock-in periods. Annual plans are non-refundable after the first 30 days.",
  },
  {
    q: "Is GST charged on the subscription?",
    a: "Yes, 18% GST is added to the subscription amount. You will receive a GST invoice for every payment.",
  },
  {
    q: "Is the data secure and backed up?",
    a: "All data is hosted on secure servers with daily backups. We use bank-grade encryption for all sensitive data.",
  },
  {
    q: "Can multiple staff use the same account?",
    a: "Yes. The Growth plan supports up to 10 staff users with role-based access — admin, accountant, coordinator, etc.",
  },
  {
    q: "What does Enterprise include?",
    a: "Enterprise is for large ashrams, multi-location trusts, or special requirements like custom integrations, API access, and dedicated onboarding. Contact us for a custom quote.",
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-4 w-4 text-[#DC2626] mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-zinc-300 mx-auto" />;
  return <span className="text-sm text-zinc-700">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-20 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-zinc-100">
        <div className="container mx-auto max-w-3xl text-center">
          <SectionBadge>Pricing</SectionBadge>
          <SectionHeading as="h1" size="3xl" className="mt-4 mb-4">
            Simple pricing for every stage of growth.
          </SectionHeading>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-[#09090B] text-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] -my-2 py-10"
                    : "bg-white border border-zinc-100"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 bg-[#DC2626] text-white w-fit mb-4">
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
                  <div className={`text-sm mb-3 ${plan.highlight ? "text-white/50" : "text-zinc-400"}`}>{plan.period}</div>
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
                  className={`w-full text-center text-sm font-semibold py-3 transition-colors ${
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

      {/* Comparison table */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-serif text-4xl font-bold text-zinc-950 mb-10 text-center">Compare all features</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-950">
                  <th className="text-left py-3 font-semibold text-zinc-500 w-1/2">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className="text-center py-3 font-bold text-zinc-950 w-1/6">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}`}>
                    <td className="py-3 text-zinc-700">{row.feature}</td>
                    <td className="py-3 text-center"><Cell value={row.starter} /></td>
                    <td className="py-3 text-center bg-zinc-950/[0.02]"><Cell value={row.growth} /></td>
                    <td className="py-3 text-center"><Cell value={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-100 border-t border-zinc-100">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold text-zinc-950 mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-zinc-200 py-6">
                <h3 className="font-semibold text-zinc-950 mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        variant="black"
        heading="Still have questions?"
        subheading="Talk to our team — we're happy to help you find the right plan."
        primaryCta={{ label: "Contact Us", href: "/contact" }}
        secondaryCta={{ label: "Start Free", href: "/auth/sign-up" }}
      />
    </>
  );
}
