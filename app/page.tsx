import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FeatureSection } from "@/components/feature-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#fbf9ef" }}>
      <Header />
      
      {/* Hero Section - Full Height */}
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]" style={{ backgroundColor: "#3c0212" }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-medium mb-6" style={{ color: "#fef9fb" }}>
            Ashram Management CRM
          </h1>
          <p className="text-xl md:text-2xl mb-8" style={{ color: "#fef9fb" }}>
            Complete solution for managing your Ashram operations, devotees, donations, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="font-bold text-lg px-8 py-6"
              style={{
                backgroundColor: "#fef9fb",
                color: "#3c0212",
              }}
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-bold text-lg px-8 py-6"
              style={{
                backgroundColor: "transparent",
                borderColor: "#fef9fb",
                color: "#fef9fb",
              }}
            >
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeatureSection />


      <Footer />
    </main>
  );
}
