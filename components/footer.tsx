import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer
      className="w-full py-8"
      style={{ backgroundColor: "#fbf9ef", borderColor: "#3c0212" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
       
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: "#3c0212" }}>
          <p className="text-sm" style={{ color: "#14181f" }}>
            © {new Date().getFullYear()} Ashram Management CRM. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm" style={{ color: "#14181f" }}>
              Powered by{" "}
              <a
                href="https://virtualxcellence.com/"
                target="_blank"
                className="font-bold hover:underline"
                rel="noreferrer"
                style={{ color: "#14181f" }}
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
