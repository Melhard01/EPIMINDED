import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";

export default function MarketProof() {
  const { t } = useLanguage();

  return (
    <section id="market-proof" className="bg-background section-padding">
      <div className="container max-w-4xl text-center">
        <SectionHeader
          eyebrow={t("home.proof.eyebrow")}
          title={t("home.proof.title")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8 mb-10">
          <Reveal variant="scale">
            <div>
              <div className="font-serif text-6xl md:text-[6rem] leading-none text-gold-hero mb-3">
                {t("home.proof.stat1")}
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t("home.proof.stat1.label")}</p>
            </div>
          </Reveal>
          <Reveal variant="scale" delay={100}>
            <div>
              <div className="font-serif text-6xl md:text-[6rem] leading-none text-gold-hero mb-3">
                {t("home.proof.stat2")}
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">{t("home.proof.stat2.label")}</p>
            </div>
          </Reveal>
        </div>
        <Reveal variant="fade" delay={120}>
          <p className="text-xs text-gold-dim italic mb-8">{t("home.proof.attribution")}</p>
        </Reveal>
        <Reveal variant="up" delay={180}>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{t("home.proof.body")}</p>
        </Reveal>
      </div>
    </section>
  );
}
