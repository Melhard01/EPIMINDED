import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import Reveal from "@/components/ui/reveal";

export default function AudienceBridge() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface section-padding">
      <div className="container">
        <Reveal className="text-center mb-12">
          <span className="eyebrow-pill">{t("bridge.eyebrow")}</span>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Reveal>
            <div className="premium-card p-8 md:p-10 h-full flex flex-col">
              <p className="text-xs uppercase tracking-wider text-gold font-medium mb-3">
                {t("bridge.card1.label")}
              </p>
              <h3 className="font-serif text-2xl mb-4">{t("bridge.card1.title")}</h3>
              <p className="text-muted-foreground leading-relaxed flex-grow mb-6">
                {t("bridge.card1.body")}
              </p>
              <Link href="/community-builders" className="text-gold hover:text-gold-hero transition-colors text-sm font-medium">
                {t("bridge.card1.cta")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="premium-card p-8 md:p-10 h-full flex flex-col">
              <p className="text-xs uppercase tracking-wider text-gold font-medium mb-3">
                {t("bridge.card2.label")}
              </p>
              <h3 className="font-serif text-2xl mb-4">{t("bridge.card2.title")}</h3>
              <p className="text-muted-foreground leading-relaxed flex-grow mb-6">
                {t("bridge.card2.body")}
              </p>
              <Link href="/enterprise" className="text-gold hover:text-gold-hero transition-colors text-sm font-medium">
                {t("bridge.card2.cta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
