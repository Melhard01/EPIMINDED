"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { cn } from "@/lib/utils";

const EASE_SOFT = [0.16, 0.84, 0.36, 1] as const;

type FourPillarsImageMotion = "pan-right-left" | "pan-left-right" | "rise";

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

const STACKED_PILLARS = ["p3", "p4"] as const;

function HabitDuoFeature() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();
  const shouldShow = isInView || Boolean(reducedMotion);

  const fadeUp = (delay: number) =>
    reducedMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          animate: shouldShow ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
          transition: { duration: 0.8, delay, ease: EASE_SOFT },
        };

  return (
    <article ref={sectionRef} className="four-pillars-habit-duo">
      <div className="four-pillars-habit-duo__grid">
        <div className="four-pillars-habit-duo__copy">
          <div className="four-pillars-habit-duo__block">
            <motion.h3
              className="four-pillars-habit-duo__heading font-serif"
              {...fadeUp(0.08)}
            >
              {t("home.pillars.p1.title")}
            </motion.h3>
            <motion.p
              className="four-pillars-habit-duo__body text-muted-foreground"
              {...fadeUp(0.18)}
            >
              {t("home.pillars.p1.body")}
            </motion.p>
          </div>
          <div className="four-pillars-habit-duo__block">
            <motion.h3
              className="four-pillars-habit-duo__heading font-serif"
              {...fadeUp(0.3)}
            >
              {t("home.pillars.p2.title")}
            </motion.h3>
            <motion.p
              className="four-pillars-habit-duo__body text-muted-foreground"
              {...fadeUp(0.4)}
            >
              {t("home.pillars.p2.body")}
            </motion.p>
          </div>
        </div>
        <div className="four-pillars-habit-duo__phone-col">
          <FourPillarsImageMotion motion="rise" delay={80}>
            <img
              src="/assets/brain-booster-mockup.png"
              alt="EpiMinded Brain Booster Preview"
              width={517}
              height={1113}
              decoding="async"
              loading="lazy"
              className="four-pillars-habit-duo__phone"
            />
          </FourPillarsImageMotion>
        </div>
      </div>
    </article>
  );
}

export default function FourPillars() {
  const { t } = useLanguage();

  return (
    <section id="four-pillars" className="four-pillars section-padding">
      <div className="four-pillars__bg" aria-hidden="true" />
      <div className="four-pillars__overlay" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="four-pillars-intro">
          <SectionHeader
            eyebrow={t("home.pillars.eyebrow")}
            title={t("home.pillars.title")}
            subtitle={t("home.pillars.subtitle")}
          />
        </div>

        <div className="space-y-10 md:space-y-14">
          <HabitDuoFeature />

          <article className="four-pillars-feature four-pillars-feature--peer-row">
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
