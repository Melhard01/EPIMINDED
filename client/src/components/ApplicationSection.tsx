import { useLanguage } from "@/contexts/LanguageContext";
import RequestCommunityForm from "@/components/RequestCommunityForm";
import Reveal from "@/components/ui/reveal";

export default function ApplicationSection() {
  const { t } = useLanguage();

  return (
    <section id="apply" className="founder-cohort-section section-padding">
      <div className="founder-cohort-section__bg" aria-hidden="true" />
      <div className="founder-cohort-section__overlay" aria-hidden="true" />

      <div className="container relative z-10 max-w-4xl mx-auto">
        <Reveal variant="up" className="mx-auto max-w-3xl text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-balance max-w-[720px] mx-auto mb-6">
            {t("finalCta.title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t("finalCta.subtitle")}</p>
        </Reveal>

        <Reveal variant="scale" delay={120}>
          <RequestCommunityForm wide showHeader />
        </Reveal>
      </div>
    </section>
  );
}
