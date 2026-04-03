import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionBadge } from "@/components/marketing/section-badge";
import { SectionHeading } from "@/components/marketing/section-heading";
import { blogPosts } from "@/lib/marketing/blog-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, guides, and best practices for Ashram administrators and spiritual community managers.",
};

const featured = blogPosts.find((p) => p.featured)!;
const rest = blogPosts.filter((p) => !p.featured);

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#09090B] py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <SectionBadge variant="black">Blog</SectionBadge>
          <SectionHeading as="h1" size="3xl" color="white" className="mt-4 mb-4">
            Insights for Ashram administrators.
          </SectionHeading>
          <p className="text-white/60 leading-relaxed max-w-xl">
            Guides, best practices, and stories from spiritual communities modernising their operations.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-100">
        <div className="container mx-auto max-w-7xl">
          <Link href={`/blog/${featured.slug}`} className="group grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative overflow-hidden aspect-[16/9]">
              <Image
                src={`https://images.unsplash.com/photo-${featured.unsplashId}?w=900&q=80`}
                alt={featured.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 bg-[#DC2626] text-white mb-4">
                Featured
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-zinc-950 leading-snug mb-4 group-hover:text-[#DC2626] transition-colors">
                {featured.title}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readTime}</span>
                <span>·</span>
                <span>{featured.category}</span>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DC2626]">
                Read article <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-zinc-100 hover:shadow-soft-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col rounded-2xl overflow-hidden"
              >
                <div className="relative overflow-hidden aspect-[16/9]">
                  <Image
                    src={`https://images.unsplash.com/photo-${post.unsplashId}?w=600&q=70`}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#DC2626] mb-3">{post.category}</span>
                  <h3 className="font-serif text-lg font-bold text-zinc-950 leading-snug mb-3 flex-1 group-hover:text-[#DC2626] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-100">
        <div className="container mx-auto max-w-xl text-center">
          <SectionBadge>Stay Updated</SectionBadge>
          <SectionHeading size="xl" className="mt-4 mb-4">Get insights in your inbox.</SectionHeading>
          <p className="text-zinc-500 text-sm mb-8">New articles, feature updates, and tips for Ashram administrators. No spam.</p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="your@ashram.org"
              className="flex-1 border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-zinc-950 transition-colors"
            />
            <button className="bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 hover:bg-[#B91C1C] transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
