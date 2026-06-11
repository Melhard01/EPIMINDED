import Reveal from "@/components/ui/reveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <Reveal className={`max-w-3xl mb-16 ${alignClass}`}>
      {eyebrow && <span className="eyebrow-pill mb-6">{eyebrow}</span>}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
