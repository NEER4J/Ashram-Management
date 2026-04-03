"use client";

interface TrustBarProps {
  items?: string[];
}

const defaultItems = [
  "Ashrams",
  "Temples",
  "Yoga Institutes",
  "Math & Peethams",
  "Spiritual Trusts",
  "NGOs",
  "Vedic Schools",
  "Dharmik Sanstha",
];

export function TrustBar({ items = defaultItems }: TrustBarProps) {
  // Duplicate to create seamless loop
  const doubled = [...items, ...items];

  return (
    <section className="py-8 border-y border-zinc-100 overflow-hidden">
      <div className="flex items-center gap-3 overflow-hidden">
        <p className="flex-shrink-0 text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 px-6 whitespace-nowrap hidden md:block">
          Trusted by
        </p>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-3 animate-[marquee_25s_linear_infinite] will-change-transform" style={{ width: "max-content" }}>
            {doubled.map((item, i) => (
              <span
                key={i}
                className="flex-shrink-0 text-xs font-medium px-4 py-1.5 border border-zinc-200 text-zinc-500 bg-white whitespace-nowrap"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
