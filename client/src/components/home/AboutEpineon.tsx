import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/reveal";
import { EPINEON_URL } from "@/lib/urls";
import { cn } from "@/lib/utils";

function AboutEpineonImageMotion({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "about-epineon-image-motion",
        "about-epineon-image-motion--pan-right-left",
        visible && "about-epineon-image-motion--visible",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function AboutEpineon() {
  const { t } = useLanguage();

  return (
    <section id="about-epineon" className="about-epineon section-padding">
      <div className="about-epineon__bg" aria-hidden="true" />
      <div className="about-epineon__overlay" aria-hidden="true" />

      <div className="container relative z-10 flex justify-center">
        <div className="about-epineon__layout">
          <Reveal variant="up" className="about-epineon__copy">
            <span className="eyebrow-pill mb-6 inline-block">
              {t("home.about.eyebrow")}
            </span>
            <h2 className="font-serif text-3xl md:text-[2rem] mb-6">{t("home.about.title")}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t("home.about.body")}</p>
            <a
              href={EPINEON_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-hero transition-colors text-sm font-medium"
            >
              {t("home.about.link")}
            </a>
          </Reveal>

          <AboutEpineonImageMotion className="about-epineon__visual overflow-visible">
            <img
              src="/assets/karim-amor-quote-card.png"
              alt={t("home.quote.attribution")}
              width={1563}
              height={1563}
              decoding="async"
              className="about-epineon__image"
            />
          </AboutEpineonImageMotion>
        </div>
      </div>
    </section>
  );
}
