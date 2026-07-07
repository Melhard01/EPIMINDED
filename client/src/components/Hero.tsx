import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import { Button } from "@/components/ui/button";
import HeroAuroraBackground from "@/components/HeroAuroraBackground";
import Reveal from "@/components/ui/reveal";
import { smoothScrollToId } from "@/lib/smoothScroll";

export default function Hero() {
  const { t } = useLanguage();
  const { openApplication } = useApplicationModal();

  const scrollToHow = () => {
    smoothScrollToId("how-it-works");
  };

  return (
    <section
      id="for-founders"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 hero-aurora hero-aurora--founders"
    >
      <HeroAuroraBackground variant="founders" />
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
                onClick={() => window.open("https://web2app-two.vercel.app/quiz", "_blank")}
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
