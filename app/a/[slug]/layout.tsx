import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AshramPublicHeader } from "@/components/marketing/ashram-public-header";
import { AshramPublicFooter } from "@/components/marketing/ashram-public-footer";

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("ashram_settings")
    .select("ashram_name, favicon_url, logo_url")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!data) return {};
  const icon = data.favicon_url || data.logo_url;
  return {
    icons: icon ? { icon: icon, apple: icon } : undefined,
  };
}

export default async function AshramPublicLayout({ children, params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: ashram } = await supabase
    .from("ashram_settings")
    .select("ashram_name, ashram_tagline, public_slug, is_public, address, phone, email, logo_url, favicon_url, cover_image_url, about_text")
    .eq("public_slug", slug)
    .eq("is_public", true)
    .single();

  if (!ashram) notFound();

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <AshramPublicHeader ashram={ashram} />
      <main className="pt-[64px]">{children}</main>
      <AshramPublicFooter ashram={ashram} />
    </div>
  );
}
