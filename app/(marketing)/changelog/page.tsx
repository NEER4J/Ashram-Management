import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { changelogEntries } from "@/lib/marketing/changelog-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in the Ashram Management platform — new features, improvements, and fixes.",
};

const typeLabel: Record<string, { label: string; color: string }> = {
  new:      { label: "New",      color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  improved: { label: "Improved", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  fixed:    { label: "Fixed",    color: "bg-zinc-50 text-zinc-600 border border-zinc-200" },
};

export default function ChangelogPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-20 md:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-b-zinc-950">
        <div className="container mx-auto max-w-3xl">
          <SectionBadge>Changelog</SectionBadge>
          <SectionHeading as="h1" size="3xl" className="mt-4 mb-4">What&apos;s new.</SectionHeading>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Every feature shipped, every improvement made — documented for you. We ship frequently.
          </p>
        </div>
      </section>

      {/* Entries */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-3xl">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-100 ml-[calc(theme(spacing.16)-1px)] hidden md:block" />

            <div className="space-y-12">
              {changelogEntries.map((entry) => (
                <div key={entry.version} className="relative md:pl-20">
                  {/* Version badge on timeline */}
                  <div className="hidden md:flex absolute left-0 top-0 items-center justify-center w-8 h-8 bg-[#DC2626] text-white text-[10px] font-bold ml-12 -translate-x-1/2 shadow-soft-sm">
                    {entry.version.slice(1)}
                  </div>

                  <div className="flex items-start gap-4 md:gap-0 flex-wrap mb-3">
                    <span className="md:hidden inline-block text-xs font-bold px-2.5 py-1 bg-[#DC2626] text-white mr-3">
                      {entry.version}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium pt-0.5">{entry.date}</span>
                  </div>

                  <h2 className="font-serif text-xl font-bold text-zinc-950 mb-4">{entry.title}</h2>

                  <ul className="space-y-3">
                    {entry.changes.map((change, i) => {
                      const t = typeLabel[change.type];
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`flex-shrink-0 text-[10px] font-bold tracking-wide px-2 py-0.5 mt-0.5 ${t.color}`}>
                            {t.label}
                          </span>
                          <span className="text-sm text-zinc-600 leading-relaxed">{change.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
