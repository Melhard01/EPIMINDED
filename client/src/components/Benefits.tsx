import { useLanguage } from "@/contexts/LanguageContext";
import { Users, Lightbulb, Globe, Shield } from "lucide-react";
import { AutoCarousel } from "@/components/ui/auto-carousel";
import { Reveal } from "@/components/ui/reveal";

const FEATURE_VISUALS = [
  { icon: Lightbulb, accent: "from-gold/20 to-transparent", label: "01" },
  { icon: Users, accent: "from-tech-data/20 to-transparent", label: "02" },
  { icon: Globe, accent: "from-gold-hero/15 to-transparent", label: "03" },
  { icon: Shield, accent: "from-white/10 to-transparent", label: "04" },
];

export default function Benefits() {
  const { t, language } = useLanguage();

  const benefits = [
    { title: t("benefits.item0.title"), text: t("benefits.item0.text"), icon: Users },
    { title: t("benefits.item1.title"), text: t("benefits.item1.text"), icon: Lightbulb },
    { title: t("benefits.item2.title"), text: t("benefits.item2.text"), icon: Globe },
    { title: t("benefits.item3.title"), text: t("benefits.item3.text"), icon: Shield },
  ];

  const carouselImages = [
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_5vvSNA_image_5e146f22.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_e3JR8j_image_dea2bd84.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_UikUKc_image_b028f35a.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_pbWsdH_image_6db0ca30.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_jEG191_image_aa1d6a9e.png",
    "https://d2xsxph8kpxj0f.cloudfront.net/310419663029695982/DefQ6LgnuuJ3tMyTNJsfie/pasted_file_HeqlRi_image_470d7750.png",
  ];

  return (
    <section id="benefits" className="section-padding bg-surface relative overflow-hidden">
      <div className="section-divider absolute top-0" />
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="order-2 lg:order-1">
            <Reveal>
              <span className="eyebrow-pill mb-6">{t("benefits.eyebrow")}</span>
              <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-12 md:mb-16 leading-tight mt-6">
                {t("benefits.title")}
              </h2>
            </Reveal>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => {
                const visual = FEATURE_VISUALS[index];
                return (
                  <Reveal key={index} delay={index * 0.08}>
                    <div className="premium-card p-6 h-full group cursor-default">
                      <div
                        className={`relative h-24 rounded-xl bg-gradient-to-br ${visual.accent} border border-border/50 mb-5 flex items-center justify-center overflow-hidden`}
                      >
                        <span className="absolute top-3 left-3 text-xs text-gold/50 font-serif">
                          {visual.label}
                        </span>
                        <benefit.icon className="w-8 h-8 text-gold/80 group-hover:text-gold group-hover:scale-110 transition-all duration-500" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-gold transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {benefit.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal className="order-1 lg:order-2 lg:sticky lg:top-32">
            <div className="aspect-[9/16] max-w-sm mx-auto premium-card-static p-3 rounded-[2.5rem] shadow-2xl">
              <div className="w-full h-full rounded-[2rem] overflow-hidden">
                <AutoCarousel images={carouselImages} interval={4000} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-24 md:mt-32 pt-16 border-t border-border">
        <Reveal className="container text-center">
          <h3 className="text-xl md:text-2xl font-serif text-foreground mb-8">
            {language === "fr" ? "Téléchargez l'application SOULCHAIN" : "Download the SOULCHAIN App"}
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/ma/app/epiminded-boost-your-thinking/id6760017792"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:-translate-y-1 hover:shadow-xl rounded-xl"
            >
              <img src="/assets/app-store-badge.svg" alt="Download on the App Store" className="h-12 w-auto" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=ai.epineon.new"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:-translate-y-1 hover:shadow-xl rounded-xl"
            >
              <img src="/assets/google-play-badge.svg" alt="Get it on Google Play" className="h-12 w-auto" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
