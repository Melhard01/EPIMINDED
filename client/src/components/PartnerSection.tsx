import { useLanguage } from "@/contexts/LanguageContext";
import RequestCommunityForm from "@/components/RequestCommunityForm";
import Reveal from "@/components/ui/reveal";

export default function PartnerSection() {
  const { t } = useLanguage();

  return (
    <section id="partner" className="partner-section atmosphere-why-now section-padding relative overflow-hidden">
      <div className="atmosphere-why-now__bg" aria-hidden="true">
        <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
        <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
      </div>
      <div className="atmosphere-why-now__grain" aria-hidden="true" />

      <div className="container relative z-10 max-w-4xl mx-auto">
        <Reveal variant="scale" delay={150}>
          <RequestCommunityForm
            wide
            showHeader
            headerTitle={t("partner.title")}
            headerSubhead={t("partner.subhead")}
          />
        </Reveal>
      </div>
    </section>
  );
}
