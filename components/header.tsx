"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full border-b" style={{ backgroundColor: "#fbf9ef", borderColor: "#3c0212" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-serif text-2xl font-bold" style={{ color: "#14181f" }}>
              Ashram
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Button
              asChild
              variant="outline"
              className="font-bold"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#14181f",
              }}
            >
              <Link href="/events">Events</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-bold"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#14181f",
              }}
            >
              <Link href="/gurukul">Store</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="font-bold"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#14181f",
              }}
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              className="font-bold"
              style={{
                backgroundColor: "#3c0212",
                color: "#fef9fb",
              }}
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
