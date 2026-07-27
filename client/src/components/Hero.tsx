import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";
import { smoothScrollToId } from "@/lib/smoothScroll";

const ColorBends = lazy(() => import("@/components/effects/ColorBends"));

const COLOR_BENDS_COLORS = ["#6b5c0a", "#3f3505", "#524608", "#2a2403"];

export default function Hero() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const scrollToHow = () => {
    smoothScrollToId("how-it-works");
  };

  return (
    <section
      id="for-founders"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 hero-aurora hero-aurora--founders"
    >
      <div className="founders-hero__bg" aria-hidden="true">
        <Suspense fallback={null}>
          <ColorBends
            colors={COLOR_BENDS_COLORS}
            rotation={-77}
            speed={0.2}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.15}
            parallax={0}
            iterations={1}
            intensity={1.35}
            bandWidth={6.5}
            transparent
            style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
          />
        </Suspense>
      </div>
      <div className="founders-hero__overlay" aria-hidden="true" />

      <div className="container relative z-10 px-4 sm:px-6">
        <div className="hero-content max-w-4xl mx-auto text-center">
          <Reveal immediate>
            <span className="eyebrow-pill hero-eyebrow">{t("hero.eyebrow")}</span>
          </Reveal>
          <Reveal immediate>
            <h1 className="hero-title hero-headline text-balance">
              {t("hero.title.lead")}{" "}
              <span className="text-gold">{t("hero.title.accent")}</span>
            </h1>
          </Reveal>
          <Reveal immediate>
            <p className="hero-subtitle text-muted-foreground text-balance">
              {t("hero.subtitle")}
            </p>
          </Reveal>
          <Reveal immediate>
            <div className="hero-cta">
              <Button
                type="button"
                onClick={() => setLocation("/quiz")}
                className="hero-cta-btn bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0"
              >
                {t("hero.cta.primary")}
              </Button>
              <Button
                variant="outline"
                onClick={scrollToHow}
                className="hero-cta-btn border-white/30 text-white hover:bg-white/10 rounded-full"
              >
                {t("hero.cta.secondary")}
              </Button>
            </div>
          </Reveal>
          <Reveal immediate>
            <p className="mt-10 text-xs sm:text-sm text-muted-foreground/60 tracking-wide">
              {t("hero.brandLine")}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
