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
    <div className={`max-w-3xl mb-16 ${alignClass}`}>
      {eyebrow && (
        <Reveal variant="fade" className={alignClass}>
          <span className="eyebrow-pill mb-6 inline-block">{eyebrow}</span>
        </Reveal>
      )}
      <Reveal variant="up" delay={eyebrow ? 80 : 0} className={alignClass}>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal variant="fade" delay={160} className={alignClass}>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
