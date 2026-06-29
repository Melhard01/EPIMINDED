import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/reveal";

export default function PainSection() {
  const { t } = useLanguage();

  return (
    <section className="pain-section section-padding">
      <div className="pain-section__bg" aria-hidden="true" />
      <div className="pain-section__overlay" aria-hidden="true" />

      <div className="container relative z-10 max-w-5xl">
        <Reveal variant="fade">
          <span className="eyebrow-pill mb-6 md:mb-8 inline-block">{t("pain.eyebrow")}</span>
        </Reveal>

        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <Reveal variant="up" delay={80} className="md:col-span-5">
            <h2 className="font-serif text-3xl md:text-3xl lg:text-4xl leading-snug">
              {t("pain.title")}
            </h2>
          </Reveal>

          <Reveal variant="up" delay={120} className="md:col-span-7">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("pain.body")}
            </p>
          </Reveal>
        </div>
      </div>

      <div className="pain-section__image-outer relative z-10">
        <Reveal variant="up" delay={160}>
          <div className="pain-section__image-wrap">
            <img
              src="/assets/where-it-gets-hard.png"
              alt={t("pain.imageAlt")}
              width={1563}
              height={1563}
              decoding="async"
              loading="lazy"
              className="pain-section__image"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
