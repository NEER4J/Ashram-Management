import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Events", href: "/events" },
    { label: "Gurukul Store", href: "/gurukul" },
    { label: "Book a Stay", href: "/book-stay" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "mailto:hello@virtualxcellence.com" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Account: [
    { label: "Login", href: "/auth/login" },
    { label: "Sign Up", href: "/auth/sign-up" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Forgot Password", href: "/auth/forgot-password" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
];

export function Footer() {
  return (
    <footer
      className="w-full border-t"
      style={{ backgroundColor: "#fbf9ef", borderColor: "rgba(60,2,18,0.2)" }}
    >
      {/* Main columns */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="font-serif text-2xl font-bold block mb-3 transition-opacity hover:opacity-70"
              style={{ color: "#3c0212" }}
            >
              Ashram
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#3c0212", opacity: 0.65 }}>
              The complete management platform for Ashrams, temples, and spiritual organisations across India.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-lg p-2 transition-all duration-150 hover:scale-110"
                  style={{ color: "#3c0212", backgroundColor: "rgba(60,2,18,0.07)" }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "#3c0212" }}
              >
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-opacity hover:opacity-60"
                      style={{ color: "#3c0212", opacity: 0.75 }}
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

      {/* Bottom bar */}
      <div
        className="border-t px-4 sm:px-6 lg:px-8 py-5"
        style={{ borderColor: "rgba(60,2,18,0.15)" }}
      >
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p style={{ color: "#3c0212", opacity: 0.55 }}>
            © {new Date().getFullYear()} Ashram Management. All rights reserved.
          </p>
          <p style={{ color: "#3c0212", opacity: 0.55 }}>
            Powered by{" "}
            <a
              href="https://virtualxcellence.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#3c0212" }}
            >
              Virtual Xcellence
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
