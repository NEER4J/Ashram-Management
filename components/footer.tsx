import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features",   href: "/features" },
    { label: "Solutions",  href: "/solutions" },
    { label: "Pricing",    href: "/pricing" },
    { label: "Changelog",  href: "/changelog" },
  ],
  Resources: [
    { label: "Events",       href: "/events" },
    { label: "Gurukul Store", href: "/gurukul" },
    { label: "Book a Stay",  href: "/book-stay" },
    { label: "Blog",         href: "/blog" },
  ],
  Company: [
    { label: "About",   href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/contact" },
    { label: "Press",   href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy",    href: "/refund" },
  ],
  Account: [
    { label: "Log In",           href: "/auth/login" },
    { label: "Sign Up",          href: "/auth/sign-up" },
    { label: "Dashboard",        href: "/dashboard" },
    { label: "Forgot Password",  href: "/auth/forgot-password" },
  ],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    svg: (
      <>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    svg: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com",
    svg: <path d="M4 4l16 16M4 20 20 4" strokeLinecap="round" />,
  },
];

export function Footer() {
  return (
    <footer className="bg-[#09090B] text-white">

      {/* ── Brand strip ─────────────────────────────────────────────────────── */}
      <div className="border-b border-white/10 px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="max-w-md">
              <Link href="/" className="font-serif text-5xl md:text-6xl font-bold text-white hover:text-white/80 transition-colors block mb-4">
                Ashram
              </Link>
              <p className="text-white/50 text-base leading-relaxed">
                The complete management platform for Ashrams, temples, and spiritual organisations across India.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#09090B] text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-white text-sm font-semibold hover:border-white/50 hover:bg-white/5 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Link columns ─────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 lg:gap-10">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/35 mb-4">
                  {section}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map(({ svg, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="p-2 text-white/35 hover:text-white transition-colors rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {svg}
                </svg>
              </a>
            ))}
          </div>

          <p className="text-xs text-white/30 text-center">
            © {new Date().getFullYear()} Ashram Management. All rights reserved.
          </p>

          <div className="flex items-center gap-3 text-xs text-white/30">
            <span>
              Powered by{" "}
              <a
                href="https://virtualxcellence.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-white/50 hover:text-white transition-colors"
              >
                Virtual Xcellence
              </a>
            </span>
            <span className="px-2 py-0.5 border border-white/15 text-[10px] font-bold tracking-wide">🇮🇳 MADE IN INDIA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
