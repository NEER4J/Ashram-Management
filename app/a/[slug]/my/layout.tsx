import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { PortalNav } from "@/components/public/portal-nav"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function MyPortalLayout({ children, params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/a/${slug}/login?next=/a/${slug}/my`)

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", user.id)
    .single()

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Devotee"
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-zinc-950 px-4 sm:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 leading-none mb-0.5">My Portal</p>
              <p className="text-sm font-semibold text-white leading-none">{displayName}</p>
            </div>
          </div>

          <Link
            href={`/a/${slug}`}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to Ashram
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden bg-white border-b border-zinc-100 shadow-sm">
        <PortalNav slug={slug} />
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-7">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden sticky top-20">
              <div className="px-4 pt-5 pb-3 border-b border-zinc-50">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Navigation</p>
              </div>
              <PortalNav slug={slug} />
              <div className="px-4 py-3 border-t border-zinc-50">
                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  Logged in as<br />
                  <span className="text-zinc-400 font-medium">{displayName}</span>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
