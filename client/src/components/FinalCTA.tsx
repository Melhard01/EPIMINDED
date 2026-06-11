import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import { Button } from "@/components/ui/button";
import { CALENDLY_TEAM } from "@/lib/urls";
import Reveal from "@/components/ui/reveal";

export default function FinalCTA() {
  const { t } = useLanguage();
  const { openApplication } = useApplicationModal();

  return (
    <section className="section-padding gold-glow">
      <div className="container max-w-3xl text-center">
        <Reveal>
          <h2 className="font-serif text-3xl md:text-5xl mb-6 leading-tight">
            {t("finalCta.title")}
          </h2>
          <p className="text-lg text-muted-foreground mb-10">{t("finalCta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={openApplication}
              className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-10 h-14 text-lg border-0 w-full sm:w-auto"
            >
              {t("finalCta.cta.primary")}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(CALENDLY_TEAM, "_blank")}
              className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-14 text-lg w-full sm:w-auto"
            >
              {t("finalCta.cta.secondary")}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
