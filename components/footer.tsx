import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer
      className="w-full py-12 md:py-16"
      style={{ backgroundColor: "#fbf9ef", borderTop: "2px solid #3c0212" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4" style={{ color: "#3c0212" }}>
              Ashram
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Experience divine spirituality, wisdom, and community. Join us for events, courses, and spiritual growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-base mb-4" style={{ color: "#3c0212" }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/events" 
                  className="text-sm text-gray-600 hover:text-[#3c0212] transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link 
                  href="/gurukul" 
                  className="text-sm text-gray-600 hover:text-[#3c0212] transition-colors"
                >
                  Store & Courses
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/login" 
                  className="text-sm text-gray-600 hover:text-[#3c0212] transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth/sign-up" 
                  className="text-sm text-gray-600 hover:text-[#3c0212] transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h4 className="font-semibold text-base mb-4" style={{ color: "#3c0212" }}>
              Contact
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              For any queries or support
            </p>
            <p className="text-sm font-medium" style={{ color: "#3c0212" }}>
              +91 7470915225
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: "#3c0212" }}>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Ashram Management CRM. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Powered by{" "}
              <a
                href="https://virtualxcellence.com/"
                target="_blank"
                className="font-bold hover:underline transition-colors"
                style={{ color: "#3c0212" }}
                rel="noreferrer"
              >
                Virtual Xcellence
              </a>
            </p>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
