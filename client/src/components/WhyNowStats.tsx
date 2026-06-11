import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";

const COLS = ["col1", "col2", "col3"] as const;

export default function WhyNowStats() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface section-padding">
      <div className="container">
        <SectionHeader eyebrow={t("whynow.eyebrow")} title={t("whynow.title")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLS.map((col, i) => (
            <Reveal key={col} variant="scale" delay={i * 120}>
              <div className="premium-card-static p-8 h-full">
                <div className="font-serif text-4xl md:text-5xl text-gold-hero mb-4">
                  {t(`whynow.${col}.stat`)}
                </div>
                <h3 className="font-serif text-lg mb-3">{t(`whynow.${col}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`whynow.${col}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
