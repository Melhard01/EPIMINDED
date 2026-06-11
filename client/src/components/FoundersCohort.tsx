import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";

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
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {t("cohort.body")}
        </p>
        <Button
          onClick={openApplication}
          className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-8 h-12 border-0"
        >
          {t("cohort.cta")}
        </Button>
      </div>
    </section>
  );
}
