import { useLanguage } from "@/contexts/LanguageContext";
import PartnerForm from "@/components/PartnerForm";
import Reveal from "@/components/ui/reveal";

export default function PartnerSection() {
  const { t } = useLanguage();

  return (
    <section id="partner" className="partner-section section-padding relative overflow-hidden">
      <div className="partner-section__bg" aria-hidden="true" />
      <div className="partner-section__overlay" aria-hidden="true" />

      <div className="container relative z-10 max-w-4xl mx-auto">
        <Reveal variant="up">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-3">
              {t("partner.title")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">{t("partner.subhead")}</p>
          </div>
        </Reveal>
        <Reveal variant="scale" delay={150}>
          <div className="partner-section-form p-6 sm:p-10 md:p-12">
            <PartnerForm wide />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
