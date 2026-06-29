import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

type FourPillarsImageMotion = "pan-right-left" | "pan-left-right" | "rise";

const MOBILE_MAX_WIDTH = 767;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;

function subscribeMediaQuery(query: string, onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useMobileLayout() {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery(MOBILE_MEDIA_QUERY, onChange),
    () => window.matchMedia(MOBILE_MEDIA_QUERY).matches,
    () => true
  );
}

function HabitDuoImage({ children }: { children: ReactNode }) {
  const isMobile = useMobileLayout();

  if (isMobile) {
    return (
      <div className="shrink-0 four-pillars-habit-duo__motion four-pillars-habit-duo__motion--mobile-static">
        {children}
      </div>
    );
  }

  return (
    <FourPillarsImageMotion motion="pan-left-right" className="shrink-0 four-pillars-habit-duo__motion">
      {children}
    </FourPillarsImageMotion>
  );
}

function FourPillarsImageMotion({
  motion,
  delay = 0,
  className,
  children,
}: {
  motion: FourPillarsImageMotion;
  delay?: number;
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
        "four-pillars-image-motion",
        `four-pillars-image-motion--${motion}`,
        visible && "four-pillars-image-motion--visible",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const HABIT_PILLARS = ["p1", "p2"] as const;
const STACKED_PILLARS = ["p3", "p4"] as const;

export default function FourPillars() {
  const { t } = useLanguage();

  return (
    <section id="four-pillars" className="four-pillars section-padding">
      <div className="four-pillars__bg" aria-hidden="true" />
      <div className="four-pillars__overlay" aria-hidden="true" />
      <div className="container relative z-10">
        <SectionHeader
          eyebrow={t("home.pillars.eyebrow")}
          title={t("home.pillars.title")}
          subtitle={t("home.pillars.subtitle")}
        />

        <div className="space-y-10 md:space-y-14">
          <article className="four-pillars-feature">
            <div className="four-pillars-feature__layout four-pillars-feature__layout--image-left four-pillars-feature__layout--habit-duo">
              <div className="four-pillars-feature__copy four-pillars-feature__copy--stacked">
                {HABIT_PILLARS.map((key) => (
                  <div key={key} className="four-pillars-feature__block">
                    <h3 className="font-serif text-3xl md:text-4xl mb-4">{t(`home.pillars.${key}.title`)}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                      {t(`home.pillars.${key}.body`)}
                    </p>
                  </div>
                ))}
              </div>
              <HabitDuoImage>
                <div className="four-pillars-habit-preview four-pillars-habit-preview--brain-booster flex justify-center shrink-0">
                  <img
                    src="/assets/brain-booster-phone.png"
                    alt="EpiMinded Brain Booster Preview"
                    width={1563}
                    height={1563}
                    decoding="async"
                    className="four-pillars-habit-preview__img"
                  />
                </div>
              </HabitDuoImage>
            </div>
          </article>

          <article className="four-pillars-feature">
            <div className="four-pillars-feature__layout">
              <div className="four-pillars-feature__copy four-pillars-feature__copy--stacked">
                {STACKED_PILLARS.map((key) => (
                  <div key={key} className="four-pillars-feature__block">
                    <h3 className="font-serif text-3xl md:text-4xl mb-4">{t(`home.pillars.${key}.title`)}</h3>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                      {t(`home.pillars.${key}.body`)}
                    </p>
                  </div>
                ))}
              </div>
              <FourPillarsImageMotion motion="rise" delay={160} className="shrink-0 self-center">
                <div className="four-pillars-feature__visual four-pillars-feature__visual--peer" aria-hidden="true">
                  <img
                    src="/assets/peer-presence-phone.png"
                    alt=""
                    className="four-pillars-feature__image"
                    width={352}
                    height={740}
                    decoding="async"
                  />
                </div>
              </FourPillarsImageMotion>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
