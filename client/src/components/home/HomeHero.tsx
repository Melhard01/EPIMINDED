import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import { Button } from "@/components/ui/button";
import { smoothScrollToId } from "@/lib/smoothScroll";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HomeHero() {
  const { t } = useLanguage();
  const { openApplication } = useApplicationModal();

  const scrollToPillars = () => {
    smoothScrollToId("four-pillars");
  };

  const motionProps = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section
      id="home-hero"
      className="home-hero relative overflow-hidden pt-24 pb-20 md:pt-32 min-h-[min(100svh,56rem)] flex flex-col"
    >
      <div className="home-hero__bg" aria-hidden="true" />
      <div className="home-hero__overlay" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 items-center w-full">
        <div className="container px-4 sm:px-6 w-full">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.p
            {...motionProps(0)}
            className="eyebrow-pill home-hero-eyebrow"
          >
            {t("home.hero.eyebrow")}
          </motion.p>

          <motion.h1
            {...motionProps(0.12)}
            className="hero-title hero-headline text-balance mt-8 max-w-[960px]"
          >
            {t("home.hero.title.lead")}{" "}
            <span className="text-gold">{t("home.hero.title.accent")}</span>
          </motion.h1>

          <motion.p
            {...motionProps(0.24)}
            className="hero-subtitle home-hero-subtitle text-muted-foreground text-balance mt-6"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.div
            {...motionProps(0.36)}
            className="mt-10 w-full max-w-full px-0 sm:px-2 flex justify-center"
          >
            <div className="hero-cta home-hero__cta">
              <Button
                onClick={openApplication}
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
          </motion.div>
        </div>
      </div>
      </div>

      <div className="home-hero__desktop-bottom-space hidden md:block shrink-0" aria-hidden="true" />
    </section>
  );
}
