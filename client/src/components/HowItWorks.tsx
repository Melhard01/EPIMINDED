import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

const STEPS = ["step1", "step2", "step3", "step4"] as const;

function badgeCenterY(badge: Element, trackTop: number) {
  const rect = badge.getBoundingClientRect();
  return (rect.top + rect.bottom) / 2 - trackTop;
}

export default function HowItWorks() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateTabletLines = () => {
      const width = window.innerWidth;
      if (width < 768 || width >= 1024) {
        track.style.removeProperty("--how-tablet-line-top");
        track.style.removeProperty("--how-tablet-line-bottom");
        return;
      }

      const badges = track.querySelectorAll<HTMLElement>(".how-journey__badge");
      if (badges.length < 4) return;

      const trackTop = track.getBoundingClientRect().top;
      const topY = (badgeCenterY(badges[0], trackTop) + badgeCenterY(badges[1], trackTop)) / 2;
      const bottomY = (badgeCenterY(badges[2], trackTop) + badgeCenterY(badges[3], trackTop)) / 2;

      track.style.setProperty("--how-tablet-line-top", `${topY}px`);
      track.style.setProperty("--how-tablet-line-bottom", `${bottomY}px`);
    };

    const scheduleUpdate = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(updateTabletLines);
      });
    };

    scheduleUpdate();
    window.addEventListener("resize", scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(track);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
    };
  }, [t, active]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={cn("how-journey section-padding relative overflow-hidden", active && "how-journey--active")}
    >
      <div className="how-journey__bg" aria-hidden="true">
        <span className="how-journey__glow how-journey__glow--a" />
        <span className="how-journey__glow how-journey__glow--b" />
      </div>
      <div className="how-journey__grain" aria-hidden="true" />

      <div className="container relative z-10">
        <SectionHeader eyebrow={t("how.eyebrow")} title={t("how.title")} />

        <div ref={trackRef} className="how-journey__track relative max-w-6xl mx-auto">
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
                {i < STEPS.length - 1 && (
                  <div
                    className="how-journey__mobile-segment"
                    aria-hidden="true"
                    style={{ transitionDelay: `${400 + i * 180}ms` }}
                  >
                    <div className="how-journey__mobile-segment-track" />
                    <div className="how-journey__mobile-segment-fill" />
                  </div>
                )}
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
