import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerProps {
  variant?: "red" | "black";
  heading: string;
  subheading?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function CtaBanner({
  variant = "red",
  heading,
  subheading,
  primaryCta,
  secondaryCta,
}: CtaBannerProps) {
  const bg = variant === "red" ? "bg-[#DC2626]" : "bg-[#09090B]";
  const primaryBtn =
    variant === "red"
      ? "bg-white text-[#09090B] hover:bg-zinc-100"
      : "bg-[#DC2626] text-white hover:bg-[#B91C1C]";

  return (
    <section className={`relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden ${bg}`}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)" }} />
      <div className="container mx-auto max-w-3xl text-center relative">
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={primaryCta.href}
            className={`inline-flex items-center gap-2 px-8 py-4 font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl rounded-xl ${primaryBtn}`}
          >
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondaryCta && (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-1.5 text-base font-medium text-white/75 hover:text-white transition-colors underline underline-offset-4"
            >
              {secondaryCta.label}
            </Link>
          )}
        </div>
        <p className="mt-8 text-sm text-white/40">
          No credit card required · Free plan available · Setup in 5 minutes
        </p>
      </div>
    </section>
  );
}
