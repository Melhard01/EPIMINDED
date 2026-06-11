import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Users } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export default function Journey() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: TrendingUp,
      title: t("journey.step1.title"),
      subtitle: t("journey.step1.subtitle"),
      text: t("journey.step1.text"),
    },
    {
      icon: Users,
      title: t("journey.step3.title"),
      subtitle: t("journey.step3.subtitle"),
      text: t("journey.step3.text"),
    },
  ];

  return (
    <section id="journey" className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 gold-glow pointer-events-none" />
      <div className="absolute inset-0 noise-overlay opacity-20 pointer-events-none" />

      <div className="container relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-20 md:mb-28">
          <span className="eyebrow-pill mb-6">{t("journey.eyebrow")}</span>
          <h2 className="text-3xl md:text-5xl font-serif text-foreground leading-tight mt-6">
            {t("journey.title")}
          </h2>
        </Reveal>

        <div className="relative max-w-4xl mx-auto">
          <div className="timeline-line hidden md:block" />

          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <Reveal key={index} delay={index * 0.15}>
                <div
                  className={`relative flex flex-col md:flex-row gap-8 md:gap-12 items-start ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gold border-4 border-background z-10" style={{ top: "2rem" }} />

                  <div className={`md:w-1/2 ${index % 2 === 1 ? "md:text-right" : ""}`}>
                    <span className="step-number block mb-2">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-widest text-gold mb-4">
                      {step.subtitle}
                    </p>
                  </div>

                  <div className={`md:w-1/2 ${index % 2 === 1 ? "md:pr-12" : "md:pl-12"}`}>
                    <div className="premium-card p-8 md:p-10 group">
                      <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-500">
                        <step.icon className="w-7 h-7 text-gold" strokeWidth={1.5} />
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
