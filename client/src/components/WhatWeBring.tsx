import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";

const LEFT_CARD_KEYS = ["card2", "card4"] as const;
const RIGHT_CARD_KEYS = ["card1", "card3"] as const;

type BringCardKey = (typeof LEFT_CARD_KEYS)[number] | (typeof RIGHT_CARD_KEYS)[number];

function BringCard({ cardKey, index }: { cardKey: BringCardKey; index: number }) {
  const { t } = useLanguage();

  return (
    <Reveal
      variant={index % 2 === 0 ? "scale" : "up"}
      delay={index * 100}
      className={`what-we-bring__card what-we-bring__card--${cardKey}`}
    >
      <div className="what-we-bring__content">
        <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-4">{t(`bring.${cardKey}.title`)}</h3>
        <p className="text-muted-foreground leading-relaxed">{t(`bring.${cardKey}.body`)}</p>
      </div>
    </Reveal>
  );
}

export default function WhatWeBring() {
  const { t } = useLanguage();

  return (
    <section className="what-we-bring section-padding">
      <div className="what-we-bring__bg" aria-hidden="true" />
      <div className="what-we-bring__overlay" aria-hidden="true" />

      <div className="container relative z-10">
        <SectionHeader eyebrow={t("bring.eyebrow")} title={t("bring.title")} />

        <div className="what-we-bring__layout">
          <div className="what-we-bring__cards what-we-bring__cards--left">
            {LEFT_CARD_KEYS.map((key, i) => (
              <BringCard key={key} cardKey={key} index={i + 1} />
            ))}
          </div>

          <div className="what-we-bring__divider" aria-hidden="true" />

          <div className="what-we-bring__cards what-we-bring__cards--right">
            {RIGHT_CARD_KEYS.map((key, i) => (
              <BringCard key={key} cardKey={key} index={i * 2} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
