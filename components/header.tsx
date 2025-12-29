"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b sticky top-0 z-50 backdrop-blur-sm bg-[#fbf9ef]/95 shadow-sm" style={{ borderColor: "#3c0212" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="font-serif text-2xl md:text-3xl font-bold transition-opacity hover:opacity-80" 
              style={{ color: "#3c0212" }}
            >
              Ashram
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            <Button
              asChild
              variant="outline"
              className="font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#3c0212",
              }}
            >
              <Link href="/events">Events</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#3c0212",
              }}
            >
              <Link href="/gurukul">Store</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-semibold rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#3c0212",
              }}
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              className="font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
              style={{
                backgroundColor: "#3c0212",
                color: "#fef9fb",
              }}
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "#3c0212" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 pt-2 border-t animate-fade-in" style={{ borderColor: "#3c0212" }}>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                variant="outline"
                className="font-semibold rounded-xl border-2 w-full justify-start"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#3c0212",
                  color: "#3c0212",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/events">Events</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-semibold rounded-xl border-2 w-full justify-start"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#3c0212",
                  color: "#3c0212",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/gurukul">Store</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-semibold rounded-xl border-2 w-full justify-start"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#3c0212",
                  color: "#3c0212",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                asChild
                className="font-semibold rounded-xl w-full justify-start shadow-md"
                style={{
                  backgroundColor: "#3c0212",
                  color: "#fef9fb",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
