import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/useMobile";
import Reveal from "@/components/ui/reveal";

const DOORS = [
  { key: "founders", href: "/founders" },
  { key: "builders", href: "/community-builders" },
  { key: "enterprise", href: "/enterprise" },
] as const;

const REVEAL_DURATION = 1100;
const CARD_STAGGER = 160;
const CARD_BASE_DELAY = 480;

function splitLink(text: string) {
  const idx = text.lastIndexOf("→");
  if (idx === -1) return { main: text, arrow: "" };
  return { main: text.slice(0, idx).trimEnd(), arrow: text.slice(idx) };
}

function useCardTilt(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const maxDeg = 5;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--tilt-x", `${(-y * maxDeg).toFixed(2)}deg`);
        el.style.setProperty("--tilt-y", `${(x * maxDeg).toFixed(2)}deg`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, ref]);
}

function DoorCard({
  doorKey,
  href,
  index,
}: {
  doorKey: (typeof DOORS)[number]["key"];
  href: string;
  index: number;
}) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useCardTilt(cardRef, !isMobile && !reducedMotion);

  const link = splitLink(t(`home.doors.${doorKey}.link`));

  return (
    <Reveal
      variant="up"
      delay={CARD_BASE_DELAY + index * CARD_STAGGER}
      duration={REVEAL_DURATION}
      className="h-full min-w-0"
    >
      <Link
        href={href}
        className={`block h-full three-doors-card-link${doorKey === "builders" ? " three-doors-card-link--offset" : ""}`}
      >
        <article ref={cardRef} className="three-doors-card h-full rounded-2xl sm:rounded-3xl">
          <p className="three-doors-card__eyebrow text-gold-dim uppercase tracking-wider font-medium">
            {t(`home.doors.${doorKey}.eyebrow`)}
          </p>
          <h3 className="three-doors-card__title font-serif leading-snug">
            {t(`home.doors.${doorKey}.title`)}
          </h3>
          <p className="three-doors-card__body text-muted-foreground leading-relaxed">
            {t(`home.doors.${doorKey}.body`)}
          </p>
          <span className="three-doors-card__link text-gold text-sm font-medium">
            <span className="three-doors-card__link-text">{link.main}</span>
            {link.arrow && (
              <span className="three-doors-card__link-arrow" aria-hidden="true">
                {link.arrow}
              </span>
            )}
          </span>
        </article>
      </Link>
    </Reveal>
  );
}

export default function ThreeDoors() {
  const { t } = useLanguage();

  return (
    <section id="three-doors" className="three-doors section-padding">
      <div className="three-doors__bg" aria-hidden="true" />
      <div className="three-doors__overlay" aria-hidden="true" />

      <div className="container three-doors__content relative z-10">
        <div className="three-doors__intro max-w-3xl mb-10 text-center mx-auto sm:mb-12 lg:mb-16">
          <Reveal variant="up" duration={REVEAL_DURATION}>
            <span className="eyebrow-pill mb-4 inline-block sm:mb-6">{t("home.doors.eyebrow")}</span>
          </Reveal>
          <Reveal variant="up" delay={140} duration={REVEAL_DURATION}>
            <h2 className="font-serif text-[clamp(1.75rem,1.35rem+2vw,3rem)] leading-tight mb-4 sm:mb-6">
              {t("home.doors.title")}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={300} duration={REVEAL_DURATION}>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-balance">
              {t("home.doors.subtitle")}
            </p>
          </Reveal>
        </div>

        <div className="three-doors-grid grid grid-cols-1 items-stretch gap-5 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {DOORS.map(({ key, href }, i) => (
            <DoorCard key={key} doorKey={key} href={href} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
