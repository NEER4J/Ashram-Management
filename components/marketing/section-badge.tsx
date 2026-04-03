interface SectionBadgeProps {
  children: React.ReactNode;
  variant?: "red-outline" | "red-filled" | "black";
}

export function SectionBadge({ children, variant = "red-outline" }: SectionBadgeProps) {
  const styles = {
    "red-outline": "border border-[#DC2626]/30 text-[#DC2626] bg-[#DC2626]/5",
    "red-filled": "bg-[#DC2626] text-white border border-transparent",
    "black": "border border-zinc-200 text-zinc-600 bg-white",
  };
  return (
    <span className={`inline-block text-[11px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded-full mb-4 ${styles[variant]}`}>
      {children}
    </span>
  );
}
