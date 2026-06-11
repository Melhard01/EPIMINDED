import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/ui/reveal";

export default function FoundersCohort() {
  const { t } = useLanguage();
  const { openApplication } = useApplicationModal();

  return (
    <section className="section-padding">
      <div className="container max-w-3xl text-center">
        <SectionHeader
          eyebrow={t("cohort.eyebrow")}
          title={t("cohort.title")}
        />
        <Reveal variant="up" delay={100}>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {t("cohort.body")}
          </p>
        </Reveal>
        <Reveal variant="scale" delay={200}>
          <Button
            onClick={openApplication}
            className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-8 h-12 border-0"
          >
            {t("cohort.cta")}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
