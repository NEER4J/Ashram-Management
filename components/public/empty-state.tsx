import Link from "next/link"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({ icon, title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
      <div className="flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-zinc-500 font-medium mb-1">{title}</p>
      <p className="text-sm text-zinc-400 mb-6">{description}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
