"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PricingPlan = {
  name: string;
  inr: string;
  usd: string;
  period: string;
  description: string;
  highlight: boolean;
  features: string[];
  cta: string;
  href: string;
};

export function PricingSection({ plans }: { plans: PricingPlan[] }) {
  const [currency, setCurrency] = useState<"inr" | "usd">("inr");

  return (
    <section
      id="pricing"
      className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-b"
      style={{ borderColor: "#3c0212" }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Heading */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full border mb-4"
            style={{ borderColor: "rgba(60,2,18,0.25)", color: "#3c0212", backgroundColor: "rgba(60,2,18,0.06)" }}
          >
            Pricing
          </span>
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            style={{ color: "#3c0212" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: "#3c0212", opacity: 0.65 }}>
            Start free. Upgrade when your Ashram grows. No hidden fees.
          </p>

          {/* Currency toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border p-1" style={{ borderColor: "rgba(60,2,18,0.2)", backgroundColor: "rgba(60,2,18,0.04)" }}>
            <button
              onClick={() => setCurrency("inr")}
              className="px-5 py-2 text-sm font-semibold font-sans rounded-full transition-all duration-200"
              style={{
                backgroundColor: currency === "inr" ? "#3c0212" : "transparent",
                color: currency === "inr" ? "#fef9fb" : "#3c0212",
              }}
            >
              ₹ INR
            </button>
            <button
              onClick={() => setCurrency("usd")}
              className="px-5 py-2 text-sm font-semibold rounded-full transition-all duration-200"
              style={{
                backgroundColor: currency === "usd" ? "#3c0212" : "transparent",
                color: currency === "usd" ? "#fef9fb" : "#3c0212",
              }}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 flex flex-col rounded-2xl border transition-all duration-200 ${plan.highlight ? "scale-[1.02]" : "hover:-translate-y-0.5"}`}
              style={{
                borderColor: plan.highlight ? "#3c0212" : "rgba(60,2,18,0.15)",
                backgroundColor: plan.highlight ? "#3c0212" : "#fef9fb",
                boxShadow: plan.highlight ? "0 16px 48px rgba(60,2,18,0.25)" : "0 2px 12px rgba(60,2,18,0.07)",
              }}
            >
              {plan.highlight && (
                <span
                  className="text-xs font-bold tracking-widest uppercase mb-4 block rounded-full px-3 py-1 w-fit"
                  style={{ color: "#3c0212", backgroundColor: "rgba(254,249,251,0.2)" }}
                >
                  Most Popular
                </span>
              )}

              <div
                className="font-serif text-xl font-bold mb-1"
                style={{ color: plan.highlight ? "#fef9fb" : "#3c0212" }}
              >
                {plan.name}
              </div>

              <div className="flex items-end gap-1 mb-2">
                {/* Render symbol in sans font so ₹ doesn't get garbled by PT Serif */}
                {(() => {
                  const raw = currency === "inr" ? plan.inr : plan.usd;
                  const match = raw.match(/^([₹$]?)(.*)$/);
                  const symbol = match?.[1] ?? "";
                  const number = match?.[2] ?? raw;
                  return (
                    <>
                      {symbol && (
                        <span
                          className="font-sans text-3xl font-bold mb-0.5"
                          style={{ color: plan.highlight ? "#fef9fb" : "#3c0212" }}
                        >
                          {symbol}
                        </span>
                      )}
                      <span
                        className="font-serif text-4xl font-bold transition-all duration-200"
                        style={{ color: plan.highlight ? "#fef9fb" : "#3c0212" }}
                      >
                        {number}
                      </span>
                    </>
                  );
                })()}
                {plan.period && (
                  <span
                    className="text-sm mb-1"
                    style={{ color: plan.highlight ? "#fef9fb" : "#3c0212", opacity: 0.6 }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Conversion hint */}
              {plan.period && (
                <p
                  className="font-sans text-xs mb-4"
                  style={{ color: plan.highlight ? "#fef9fb" : "#3c0212", opacity: 0.45 }}
                >
                  {currency === "inr" ? "≈ $36 / month" : "≈ ₹2,999 / month"}
                </p>
              )}

              <p
                className="text-sm mb-6"
                style={{ color: plan.highlight ? "#fef9fb" : "#3c0212", opacity: 0.65 }}
              >
                {plan.description}
              </p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: plan.highlight ? "#fef9fb" : "#3c0212" }}
                  >
                    <Check
                      className="h-4 w-4 mt-0.5 flex-shrink-0"
                      style={{ color: plan.highlight ? "#fef9fb" : "#3c0212" }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="rounded-xl font-semibold border-2 w-full transition-all duration-200 hover:-translate-y-0.5"
                style={
                  plan.highlight
                    ? { backgroundColor: "#fef9fb", color: "#3c0212", borderColor: "#fef9fb" }
                    : { backgroundColor: "transparent", color: "#3c0212", borderColor: "#3c0212" }
                }
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
