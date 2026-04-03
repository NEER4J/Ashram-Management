interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  ashram: string;
  initials: string;
}

export function TestimonialCard({ quote, name, role, ashram, initials }: TestimonialCardProps) {
  return (
    <div className="bg-white p-8 flex flex-col border border-zinc-100 hover:-translate-y-0.5 transition-all duration-200 rounded-2xl">
      <div className="font-serif text-6xl leading-none text-[#DC2626]/20 mb-4 select-none">&ldquo;</div>
      <p className="text-zinc-600 text-sm leading-relaxed flex-1 mb-8">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[#DC2626] text-white font-bold text-sm">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-sm text-zinc-900">{name}</div>
          <div className="text-xs text-zinc-400">{role}, {ashram}</div>
        </div>
      </div>
    </div>
  );
}
