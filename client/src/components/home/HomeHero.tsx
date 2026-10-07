import type { CSSProperties } from "react";
import EffectBoundary from "@/components/effects/EffectBoundary";
import LiquidFlow2D from "@/components/effects/LiquidFlow2D";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { smoothScrollToId } from "@/lib/smoothScroll";
import { track } from "@/lib/analytics";

const LIQUID_COLORS = ["#e8ce92", "#c6a15b", "#9c7c3c"];

/**
 * Stagger for the hero's entry animation. The animation itself is the
 * `.hero-rise` rule in index.css — same curve, duration and offsets the
 * framer-motion transition used, but running from the stylesheet so it starts
 * on the first painted frame instead of waiting for the bundle to hydrate.
 */
function rise(delay: number): CSSProperties {
  return { "--hero-rise-delay": `${delay}s` } as CSSProperties;
}

export default function HomeHero() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const scrollToPillars = () => {
    track("cta_clicked", { cta: "hero_how_it_works", route: "/", destination: "#four-pillars" });
    smoothScrollToId("four-pillars");
  };

  return (
    <section
      id="home-hero"
      className="home-hero relative overflow-hidden pt-28 pb-20 md:pt-40 min-h-[min(100svh,56rem)] flex flex-col"
    >
      <div className="home-hero__bg" aria-hidden="true">
        <EffectBoundary>
          <LiquidFlow2D colors={LIQUID_COLORS} mouseForce={0.09} />
        </EffectBoundary>
      </div>
      <div className="home-hero__overlay" aria-hidden="true" />
      <div className="home-hero__gold-glow" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 items-center w-full pt-6 md:pt-10">
        <div className="container px-4 sm:px-6 w-full">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <p
              style={rise(0)}
              className="hero-rise eyebrow-pill home-hero-eyebrow"
            >
              {t("home.hero.eyebrow")}
            </p>

            <h1
              style={rise(0.12)}
              className="hero-rise hero-title hero-headline text-balance mt-8 max-w-[960px]"
            >
              {t("home.hero.title.lead")}{" "}
              <span className="text-gold">{t("home.hero.title.accent")}</span>
            </h1>

            <p
              style={rise(0.24)}
              className="hero-rise hero-subtitle home-hero-subtitle text-muted-foreground text-balance mt-6"
            >
              {t("home.hero.subtitle")}
            </p>

            <div
              style={rise(0.36)}
              className="hero-rise mt-10 w-full max-w-full px-0 sm:px-2 flex justify-center"
            >
              <div className="hero-cta home-hero__cta">
                <Button
                  type="button"
                  onClick={() => {
                    track("cta_clicked", { cta: "hero_apply", route: "/", destination: "/quiz" });
                    setLocation("/quiz");
                  }}
                  className="hero-cta-btn home-hero__cta-btn bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0"
                >
                  {t("home.hero.cta.primary")}
                </Button>
                <Button
                  variant="outline"
                  onClick={scrollToPillars}
                  className="hero-cta-btn home-hero__cta-btn border-white/30 text-white hover:bg-white/10 rounded-full"
                >
                  {t("home.hero.cta.secondary")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-hero__desktop-bottom-space hidden md:block shrink-0" aria-hidden="true" />
    </section>
  );
}
