import { useLanguage } from "@/contexts/LanguageContext";
import SectionHeader from "@/components/shared/SectionHeader";
import StatCalloutGrid from "@/components/shared/StatCalloutGrid";

const STEPS = ["step1", "step2", "step3"] as const;

export default function EnterpriseHowSection() {
  const { t } = useLanguage();

  const items = STEPS.map((step, i) => ({
    metric: String(i + 1).padStart(2, "0"),
    caption: t(`enterprise.how.${step}.caption`),
    title: t(`enterprise.how.${step}.title`),
    body: t(`enterprise.how.${step}.body`),
  }));

  return (
    <section className="enterprise-how-section atmosphere-why-now section-padding relative overflow-hidden">
      <div className="atmosphere-why-now__bg" aria-hidden="true">
        <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
        <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
      </div>
      <div className="atmosphere-why-now__grain" aria-hidden="true" />

      <div className="container relative z-10">
        <SectionHeader eyebrow={t("enterprise.how.eyebrow")} title={t("enterprise.how.title")} />
        <StatCalloutGrid items={items} />
      </div>
    </section>
  );
}
