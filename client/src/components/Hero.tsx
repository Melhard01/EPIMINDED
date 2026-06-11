import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import { Button } from "@/components/ui/button";
import HeroAuroraBackground from "@/components/HeroAuroraBackground";
import Reveal from "@/components/ui/reveal";

export default function Hero() {
  const { t } = useLanguage();
  const { openApplication } = useApplicationModal();

  const scrollToHow = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="for-founders"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 hero-aurora"
    >
      <HeroAuroraBackground variant="founders" />
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal immediate>
            <span className="eyebrow-pill">{t("hero.eyebrow")}</span>
          </Reveal>
          <Reveal immediate>
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-balance mt-6">
              {t("hero.title.lead")}{" "}
              <span className="text-gold">{t("hero.title.accent")}</span>
            </h1>
          </Reveal>
          <Reveal immediate>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
              {t("hero.subtitle")}
            </p>
          </Reveal>
          <Reveal immediate>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={openApplication}
                className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-10 h-14 text-lg border-0 w-full sm:w-auto"
              >
                {t("hero.cta.primary")}
              </Button>
              <Button
                variant="outline"
                onClick={scrollToHow}
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg w-full sm:w-auto"
              >
                {t("hero.cta.secondary")}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
