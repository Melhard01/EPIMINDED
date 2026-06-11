import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

export default function HowItWorks() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={cn("how-journey section-padding relative overflow-hidden", active && "how-journey--active")}
    >
      <div className="how-journey__glow" aria-hidden="true" />

      <div className="container relative z-10">
        <SectionHeader eyebrow={t("how.eyebrow")} title={t("how.title")} />

        <div className="how-journey__track relative max-w-6xl mx-auto">
          {/* Desktop — horizontal connector */}
          <div className="how-journey__connector how-journey__connector--desktop" aria-hidden="true">
            <div className="how-journey__line-track how-journey__line-track--horizontal" />
            <div className="how-journey__line-fill how-journey__line-fill--horizontal" />
          </div>

          {/* Tablet — row connectors */}
          <div className="how-journey__connector how-journey__connector--tablet" aria-hidden="true">
            <div className="how-journey__line-track how-journey__line-track--tablet-h how-journey__line-track--tablet-h-top" />
            <div className="how-journey__line-fill how-journey__line-fill--horizontal how-journey__line-fill--tablet-h-top" />
            <div className="how-journey__line-track how-journey__line-track--tablet-v" />
            <div className="how-journey__line-fill how-journey__line-fill--vertical how-journey__line-fill--tablet-v" />
            <div className="how-journey__line-track how-journey__line-track--tablet-h how-journey__line-track--tablet-h-bottom" />
            <div className="how-journey__line-fill how-journey__line-fill--horizontal how-journey__line-fill--tablet-h-bottom" />
          </div>

          {/* Mobile — vertical connector */}
          <div className="how-journey__connector how-journey__connector--mobile" aria-hidden="true">
            <div className="how-journey__line-track how-journey__line-track--vertical" />
            <div className="how-journey__line-fill how-journey__line-fill--vertical" />
          </div>

          <div className="how-journey__steps">
            {STEPS.map((step, i) => (
              <article
                key={step}
                className="how-journey__step"
                style={{ transitionDelay: `${220 + i * 130}ms` }}
              >
                <div className="how-journey__badge-wrap">
                  <div className="how-journey__badge">
                    <span className="how-journey__number">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                </div>
                <div className="how-journey__card">
                  <h3 className="font-serif text-xl mb-3">{t(`how.${step}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{t(`how.${step}.body`)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="how-journey__outcome" style={{ transitionDelay: "780ms" }}>
          <span className="how-journey__outcome-label">{t("how.outcome")}</span>
        </div>
      </div>
    </section>
  );
}
