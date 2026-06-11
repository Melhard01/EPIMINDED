import { useLanguage } from "@/contexts/LanguageContext";
import ApplicationForm from "@/components/ApplicationForm";
import Reveal from "@/components/ui/reveal";

export default function ApplicationSection() {
  const { t } = useLanguage();

  return (
    <section id="apply" className="section-padding bg-surface border-t border-[#303030]">
      <div className="container max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl md:text-3xl leading-tight mb-3">
              {t("apply.title")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">{t("apply.subhead")}</p>
          </div>
          <div className="bg-card border border-[#303030] rounded-2xl p-6 sm:p-10 md:p-12">
            <ApplicationForm wide />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
