import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main 
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" 
      style={{ backgroundColor: "#3c0212" }}
    >
      <div className="container mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h1 
            className="font-serif text-9xl md:text-[12rem] font-bold mb-4 leading-none"
            style={{ color: "#fef9fb" }}
          >
            404
          </h1>
         
        </div>
        
        <div className="space-y-4 mb-8">
          <h2 
            className="font-serif text-3xl md:text-4xl font-semibold"
            style={{ color: "#fef9fb" }}
          >
            Oops! You're in the wrong place
          </h2>
          <p 
            className="text-lg md:text-xl"
            style={{ color: "#fef9fb" }}
          >
            This page doesn't exist or is currently under development.
          </p>
          <p 
            className="text-base md:text-lg opacity-90"
            style={{ color: "#fef9fb" }}
          >
            Don't worry, let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="font-semibold text-base px-8 py-6"
            style={{
              backgroundColor: "#fef9fb",
              color: "#3c0212",
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
            className="font-semibold text-base px-8 py-6"
            style={{
              backgroundColor: "transparent",
              borderColor: "#fef9fb",
              color: "#fef9fb",
            }}
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

