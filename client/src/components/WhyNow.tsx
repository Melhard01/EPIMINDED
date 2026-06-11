import { useLanguage } from "@/contexts/LanguageContext";
import { Reveal } from "@/components/ui/reveal";

export default function WhyNow() {
  const { t } = useLanguage();

  return (
    <section id="why" className="section-padding bg-surface relative overflow-hidden">
      <div className="section-divider absolute top-0" />
      <div className="absolute inset-0 gold-glow pointer-events-none opacity-60" />

      <div className="container relative">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
            <Reveal className="md:col-span-5 space-y-6">
              <div className="w-12 h-px bg-gold" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-[1.12]">
                {t("why.title")}
              </h2>
            </Reveal>

            <Reveal className="md:col-span-7" delay={0.1}>
              <div className="premium-card p-8 md:p-12 relative">
                <div className="absolute top-0 left-8 md:left-12 w-px h-12 bg-gradient-to-b from-gold to-transparent" />
                <p className="text-base md:text-lg text-muted-foreground leading-[1.75]">
                  {t("why.text")}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
