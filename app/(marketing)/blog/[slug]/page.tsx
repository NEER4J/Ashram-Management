import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/lib/marketing/blog-data";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);

  return (
    <>
      <article className="bg-white">
        {/* Header */}
        <div className="border-b border-zinc-100 py-10 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
            <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 bg-[#DC2626] text-white mb-4">
              {post.category}
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-zinc-950 leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
              <span>·</span>
              <span>By {post.author}</span>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="relative aspect-[16/7] overflow-hidden">
          <Image
            src={`https://images.unsplash.com/photo-${post.unsplashId}?w=1400&q=80`}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl">
            <div className="prose prose-zinc prose-lg max-w-none">
              <p className="text-xl text-zinc-600 leading-relaxed font-medium">{post.excerpt}</p>

              <p>
                The landscape of spiritual community management in India is rapidly evolving. Where once every operation was handled through physical registers, word-of-mouth, and intuition built over decades, today&apos;s Ashram administrators are increasingly turning to digital tools to handle the growing complexity of their communities.
              </p>

              <h2>The challenge of scale</h2>
              <p>
                A medium-sized Ashram might have 500-1,000 regular devotees, run 10-20 events per year, manage a guest facility, maintain a kitchen, and handle several crores in donations annually. Managing all this across spreadsheets, WhatsApp, and physical registers creates enormous operational strain — and risk.
              </p>

              <h2>What good digital management looks like</h2>
              <p>
                The best approach to digital management for Ashrams is one that respects the existing workflows and culture of the institution, rather than imposing corporate frameworks that don&apos;t fit. Devotees are not customers. Prasad distribution is not logistics. Seva is not &ldquo;human resources.&rdquo;
              </p>
              <p>
                The right platform should understand these distinctions and build features that feel natural to those who operate in this world — while still providing the operational rigour and compliance that a well-run institution demands.
              </p>

              <h2>Starting small and growing</h2>
              <p>
                One of the most important principles for Ashrams transitioning to digital management is to start with one or two modules — perhaps devotee management and donations — and expand from there. Trying to digitise everything at once often leads to adoption failure and a return to old habits.
              </p>
              <p>
                The Ashram Management platform is specifically designed with this in mind: every module is independent, can be activated on demand, and connects naturally to the rest of the system when you&apos;re ready.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 border-t border-zinc-100">
          <div className="container mx-auto max-w-7xl">
            <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-white border border-zinc-100 hover:shadow-soft-md transition-all flex flex-col rounded-2xl overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[16/9]">
                    <Image
                      src={`https://images.unsplash.com/photo-${p.unsplashId}?w=600&q=70`}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#DC2626] block mb-2">{p.category}</span>
                    <h3 className="font-serif text-base font-bold text-zinc-950 leading-snug group-hover:text-[#DC2626] transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
