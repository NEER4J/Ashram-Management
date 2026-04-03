import Link from "next/link";

interface AshramPublicFooterProps {
  ashram: {
    ashram_name: string;
    public_slug: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
}

export function AshramPublicFooter({ ashram }: AshramPublicFooterProps) {
  return (
    <footer className="bg-zinc-950 text-white py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 pb-10 border-b border-white/10">
          <div>
            <p className="font-serif text-xl font-bold mb-3">{ashram.ashram_name}</p>
            {ashram.address && <p className="text-sm text-white/50 leading-relaxed">{ashram.address}</p>}
          </div>
          {(ashram.phone || ashram.email) && (
            <div>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-3">Contact</p>
              {ashram.phone && <p className="text-sm text-white/70">{ashram.phone}</p>}
              {ashram.email && <p className="text-sm text-white/70">{ashram.email}</p>}
            </div>
          )}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-3">Quick Links</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href={`/a/${ashram.public_slug}/events`} className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href={`/a/${ashram.public_slug}/courses`} className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link href={`/a/${ashram.public_slug}/stay`} className="hover:text-white transition-colors">Book a Stay</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {new Date().getFullYear()} {ashram.ashram_name}. All rights reserved.</p>
          <Link href="/" className="hover:text-white/60 transition-colors">
            Powered by Ashram Management Platform ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}
