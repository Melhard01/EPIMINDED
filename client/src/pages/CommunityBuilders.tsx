import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApplicationModal } from "@/contexts/ApplicationModalContext";
import PartnerSection from "@/components/PartnerSection";
import HeroAuroraBackground from "@/components/HeroAuroraBackground";

const BRING_CARDS = ["card1", "card2", "card3"] as const;
const PARTNERSHIP_STEPS = ["step1", "step2", "step3"] as const;
const WORKS_ITEMS = ["item1", "item2", "item3", "item4"] as const;
const DOESNT_ITEMS = ["item1", "item2", "item3", "item4"] as const;

export default function CommunityBuilders() {
  const { t } = useLanguage();
  const { openPartner } = useApplicationModal();

  const scrollToPartnership = () => {
    document.getElementById("partnership")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <Navbar />
      <main>
        <section
          id="for-community-builders"
          className="relative overflow-hidden pt-24 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-40 hero-aurora"
        >
          <HeroAuroraBackground variant="builders" />
          <div className="container relative z-10 px-4 sm:px-6">
            <div className="hero-content max-w-4xl mx-auto text-center">
              <Reveal immediate>
                <span className="eyebrow-pill hero-eyebrow">{t("builders.hero.eyebrow")}</span>
              </Reveal>
              <Reveal immediate>
                <h1 className="font-serif hero-headline text-balance">
                  {t("builders.hero.title")}
                </h1>
              </Reveal>
              <Reveal immediate>
                <p className="hero-subtitle text-muted-foreground text-balance">
                  {t("builders.hero.subtitle")}
                </p>
              </Reveal>
              <Reveal immediate>
                <div className="hero-cta">
                  <Button
                    onClick={openPartner}
                    className="hero-cta-btn bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0"
                  >
                    {t("builders.hero.cta.primary")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={scrollToPartnership}
                    className="hero-cta-btn border-white/30 text-white hover:bg-white/10 rounded-full"
                  >
                    {t("builders.hero.cta.secondary")}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-surface section-padding">
          <div className="container max-w-3xl">
            <SectionHeader eyebrow={t("builders.ceiling.eyebrow")} title={t("builders.ceiling.title")} align="left" />
            <div className="space-y-6">
              {t("builders.ceiling.body")
                .split("\n\n")
                .map((paragraph, i) => (
                  <Reveal key={i} variant="up" delay={i * 100}>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  </Reveal>
                ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container">
            <SectionHeader eyebrow={t("builders.bring.eyebrow")} title={t("builders.bring.title")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BRING_CARDS.map((card, i) => (
                <Reveal key={card} variant="scale" delay={i * 100}>
                  <div className="premium-card p-8 h-full">
                    <h3 className="font-serif text-xl mb-4">{t(`builders.bring.${card}.title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(`builders.bring.${card}.body`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="partnership" className="bg-surface section-padding">
          <div className="container max-w-4xl">
            <SectionHeader eyebrow={t("builders.partnership.eyebrow")} title={t("builders.partnership.title")} />
            <div className="space-y-10">
              {PARTNERSHIP_STEPS.map((step, i) => (
                <Reveal key={step} variant="up" delay={i * 120}>
                  <div className="flex gap-6">
                    <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-serif text-xl mb-3">{t(`builders.partnership.${step}.title`)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(`builders.partnership.${step}.body`)}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container max-w-5xl">
            <SectionHeader eyebrow={t("builders.fit.eyebrow")} title={t("builders.fit.title")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Reveal variant="left">
                <div className="premium-card-static p-8">
                  <h3 className="font-serif text-lg mb-4 text-gold">{t("builders.fit.works.title")}</h3>
                  <ul className="space-y-3">
                    {WORKS_ITEMS.map((item) => (
                      <li key={item} className="text-muted-foreground text-sm leading-relaxed flex gap-2">
                        <span className="text-gold">+</span>
                        {t(`builders.fit.works.${item}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal variant="right" delay={120}>
                <div className="premium-card-static p-8">
                  <h3 className="font-serif text-lg mb-4">{t("builders.fit.doesnt.title")}</h3>
                  <ul className="space-y-3">
                    {DOESNT_ITEMS.map((item) => (
                      <li key={item} className="text-muted-foreground text-sm leading-relaxed flex gap-2">
                        <span className="text-muted-foreground/60">-</span>
                        {t(`builders.fit.doesnt.${item}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="bg-surface section-padding gold-glow">
          <div className="container max-w-3xl text-center">
            <Reveal variant="scale">
              <h2 className="font-serif text-3xl md:text-5xl mb-6">{t("builders.finalCta.title")}</h2>
              <p className="text-lg text-muted-foreground mb-10">{t("builders.finalCta.subtitle")}</p>
              <Button onClick={openPartner} className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-10 h-14 border-0">
                {t("builders.finalCta.cta.primary")}
              </Button>
            </Reveal>
          </div>
        </section>

        <PartnerSection />
      </main>
      <Footer />
    </div>
  );
}
