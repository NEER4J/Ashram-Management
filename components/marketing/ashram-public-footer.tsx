import Link from "next/link"

interface AshramPublicFooterProps {
  ashram: {
    ashram_name: string
    public_slug: string
    address?: string | null
    phone?: string | null
    email?: string | null
  }
}

export function AshramPublicFooter({ ashram }: AshramPublicFooterProps) {
  const slug = ashram.public_slug
  return (
    <footer className="bg-zinc-950 text-white py-14 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="md:col-span-1">
            <p className="font-serif text-xl font-bold mb-3">{ashram.ashram_name}</p>
            {ashram.address && <p className="text-sm text-white/50 leading-relaxed">{ashram.address}</p>}
            {(ashram.phone || ashram.email) && (
              <div className="mt-3 space-y-1">
                {ashram.phone && <a href={`tel:${ashram.phone}`} className="block text-sm text-white/50 hover:text-white transition-colors">{ashram.phone}</a>}
                {ashram.email && <a href={`mailto:${ashram.email}`} className="block text-sm text-white/50 hover:text-white transition-colors">{ashram.email}</a>}
              </div>
            )}
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-4">Activities</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href={`/a/${slug}/events`} className="hover:text-white transition-colors">Events & Festivals</Link></li>
              <li><Link href={`/a/${slug}/courses`} className="hover:text-white transition-colors">Courses & Materials</Link></li>
              <li><Link href={`/a/${slug}/pujas`} className="hover:text-white transition-colors">Book a Puja</Link></li>
              <li><Link href={`/a/${slug}/seva`} className="hover:text-white transition-colors">Seva & Volunteering</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-4">Visit</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href={`/a/${slug}/stay`} className="hover:text-white transition-colors">Book a Stay</Link></li>
              <li><Link href={`/a/${slug}/donate`} className="hover:text-white transition-colors">Donate</Link></li>
              <li><Link href={`/a/${slug}#contact`} className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-white/40 mb-4">Account</p>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href={`/a/${slug}/my`} className="hover:text-white transition-colors">My Portal</Link></li>
              <li><Link href={`/a/${slug}/my/bookings`} className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link href={`/a/${slug}/my/events`} className="hover:text-white transition-colors">My Events</Link></li>
              <li><Link href={`/a/${slug}/my/courses`} className="hover:text-white transition-colors">My Courses</Link></li>
              <li><Link href={`/a/${slug}/my/seva`} className="hover:text-white transition-colors">My Seva</Link></li>
              <li><Link href={`/a/${slug}/login`} className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/30">
          <p>© {new Date().getFullYear()} {ashram.ashram_name}. All rights reserved.</p>
          <Link href="/" className="hover:text-white/60 transition-colors">Powered by Ashram Management Platform ↗</Link>
        </div>
      </div>
    </footer>
  )
}
