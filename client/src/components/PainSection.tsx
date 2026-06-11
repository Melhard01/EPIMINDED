import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";

export default function PainSection() {
  const { t } = useLanguage();

  return (
    <section className="section-padding">
      <div className="container max-w-3xl">
        <SectionHeader
          eyebrow={t("pain.eyebrow")}
          title={t("pain.title")}
          align="left"
        />
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("pain.body")}
        </p>
      </div>
    </section>
  );
}
