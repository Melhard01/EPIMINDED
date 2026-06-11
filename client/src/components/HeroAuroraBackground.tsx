import { cn } from "@/lib/utils";

type AuroraVariant = "builders" | "founders";

interface HeroAuroraBackgroundProps {
  variant: AuroraVariant;
}

export default function HeroAuroraBackground({ variant }: HeroAuroraBackgroundProps) {
  return (
    <div className={cn("hero-aurora__mesh", `hero-aurora__mesh--${variant}`)} aria-hidden="true">
      <div className="hero-aurora__blob hero-aurora__blob--gold" />
      <div className="hero-aurora__blob hero-aurora__blob--gold-light" />
      <div className="hero-aurora__blob hero-aurora__blob--gray" />
      <div className="hero-aurora__blob hero-aurora__blob--dark" />
      <div className="hero-aurora__noise" />
    </div>
  );
}
