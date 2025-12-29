import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="relative mb-8 opacity-0 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3c0212] via-[#4a0318] to-[#3c0212] opacity-10 rounded-full blur-3xl"></div>
            <h1 
              className="font-serif text-8xl sm:text-9xl md:text-[12rem] font-bold mb-4 leading-none relative z-10"
              style={{ color: "#3c0212" }}
            >
              404
            </h1>
          </div>
          
          <div className="space-y-4 mb-8 md:mb-12 opacity-0 animate-fade-in-delay" style={{ animationDelay: '200ms' }}>
            <h2 
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
              style={{ color: "#3c0212" }}
            >
              Oops! You're in the wrong place
            </h2>
            <p 
              className="text-base sm:text-lg md:text-xl text-gray-600"
            >
              This page doesn't exist or is currently under development.
            </p>
            <p 
              className="text-sm sm:text-base md:text-lg text-gray-500"
            >
              Don't worry, let's get you back on track.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in-delay" style={{ animationDelay: '400ms' }}>
            <Button
              asChild
              size="lg"
              className="font-semibold text-base px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
              style={{
                backgroundColor: "#3c0212",
                color: "#fef9fb",
              }}
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-semibold text-base px-8 py-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: "transparent",
                borderColor: "#3c0212",
                color: "#3c0212",
              }}
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

