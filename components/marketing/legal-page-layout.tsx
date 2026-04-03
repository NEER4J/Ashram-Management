interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="border-b border-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#DC2626] mb-3">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-zinc-950 mb-4">{title}</h1>
          <p className="text-sm text-zinc-400">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-zinc-400 mb-4">Contents</p>
              <nav className="space-y-1.5">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-sm text-zinc-500 hover:text-zinc-900 hover:pl-2 transition-all duration-150 py-0.5 border-l-2 border-transparent hover:border-[#DC2626] pl-3"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {sections.map((s) => (
              <section key={s.id} id={s.id}>
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4 pb-3 border-b border-zinc-100">
                  {s.title}
                </h2>
                <div className="text-sm text-zinc-600 leading-relaxed space-y-4 [&_p]:text-zinc-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:font-semibold [&_strong]:text-zinc-900">
                  {s.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
