import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <Header />
      <main className="pt-[68px]">{children}</main>
      <Footer />
    </div>
  );
}
