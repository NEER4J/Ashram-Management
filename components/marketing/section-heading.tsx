interface SectionHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "2xl" | "3xl" | "4xl";
  color?: "black" | "white";
  className?: string;
}

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "3xl",
  color = "black",
  className = "",
}: SectionHeadingProps) {
  const sizes = {
    xl:  "text-2xl sm:text-3xl md:text-4xl",
    "2xl": "text-3xl sm:text-4xl md:text-5xl",
    "3xl": "text-4xl sm:text-5xl md:text-6xl",
    "4xl": "text-5xl sm:text-6xl md:text-7xl",
  };
  const colors = {
    black: "text-zinc-950",
    white: "text-white",
  };
  return (
    <Tag
      className={`font-serif font-bold leading-[1.1] tracking-tight ${sizes[size]} ${colors[color]} ${className}`}
    >
      {children}
    </Tag>
  );
}
