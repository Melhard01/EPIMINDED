import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import ApplicationForm from "@/components/ApplicationForm";
import Reveal from "@/components/ui/reveal";

export default function HomeCTA() {
  const { t } = useLanguage();

  return (
    <section id="apply" className="home-cta founder-cohort-section section-padding overflow-hidden">
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
          <div className="founder-cohort-form mx-auto w-full p-6 sm:p-10 md:p-12">
            <ApplicationForm wide showHeader />
          </div>
        </Reveal>

        <Reveal variant="fade" delay={200}>
          <p className="mt-8 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link href="/community-builders" className="hover:text-gold transition-colors">
              {t("home.cta.builders")}
            </Link>
            <span className="hidden sm:inline text-border">·</span>
            <Link href="/enterprise" className="hover:text-gold transition-colors">
              {t("home.cta.enterprise")}
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
