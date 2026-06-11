import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";

const CARD_KEYS = ["card1", "card2", "card3", "card4"] as const;

export default function WhatWeBring() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface section-padding">
      <div className="container">
        <SectionHeader eyebrow={t("bring.eyebrow")} title={t("bring.title")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CARD_KEYS.map((key, i) => (
            <Reveal key={key} delay={i * 80}>
              <div className="premium-card p-8 md:p-10 h-full">
                <h3 className="font-serif text-xl md:text-2xl mb-4">
                  {t(`bring.${key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`bring.${key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
