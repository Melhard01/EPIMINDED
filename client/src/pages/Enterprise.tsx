import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CALENDLY_ENTERPRISE } from "@/lib/urls";

const BRING_CARDS = ["card1", "card2", "card3"] as const;
const HOW_STEPS = ["step1", "step2", "step3"] as const;
const MEMBER_BLOCKS = ["block1", "block2"] as const;

export default function Enterprise() {
  const { t } = useLanguage();

  const scrollToMember = () => {
    document.getElementById("member-experience")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <Navbar />
      <main>
        <section id="for-organisations" className="relative overflow-hidden pt-24 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-40 hero-mesh">
          <div className="container max-w-4xl mx-auto text-center">
            <Reveal immediate>
              <span className="eyebrow-pill">{t("enterprise.hero.eyebrow")}</span>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mt-6 mb-6 leading-tight">
                {t("enterprise.hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                {t("enterprise.hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => window.open(CALENDLY_ENTERPRISE, "_blank")} className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-10 h-14 border-0 w-full sm:w-auto">
                  {t("enterprise.hero.cta.primary")}
                </Button>
                <Button variant="outline" onClick={scrollToMember} className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-14 w-full sm:w-auto">
                  {t("enterprise.hero.cta.secondary")}
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-surface section-padding">
          <div className="container max-w-3xl">
            <SectionHeader eyebrow={t("enterprise.completion.eyebrow")} title={t("enterprise.completion.title")} align="left" />
            <div className="space-y-6">
              {t("enterprise.completion.body")
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
            <SectionHeader eyebrow={t("enterprise.bring.eyebrow")} title={t("enterprise.bring.title")} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BRING_CARDS.map((card, i) => (
                <Reveal key={card} variant="scale" delay={i * 100}>
                  <div className="premium-card p-8 h-full">
                    <h3 className="font-serif text-xl mb-3">{t(`enterprise.bring.${card}.title`)}</h3>
                    <p className="text-foreground font-medium mb-4 leading-snug">
                      {t(`enterprise.bring.${card}.subtitle`)}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{t(`enterprise.bring.${card}.body`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface section-padding">
          <div className="container max-w-4xl text-center">
            <SectionHeader eyebrow={t("enterprise.sticks.eyebrow")} title={t("enterprise.sticks.title")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <Reveal variant="left">
                <div className="premium-card-static p-8">
                  <div className="font-serif text-5xl text-gold-hero mb-2">{t("enterprise.sticks.stat1")}</div>
                  <p className="text-sm text-muted-foreground">{t("enterprise.sticks.stat1.label")}</p>
                </div>
              </Reveal>
              <Reveal variant="right" delay={120}>
                <div className="premium-card-static p-8">
                  <div className="font-serif text-5xl text-gold-hero mb-2">{t("enterprise.sticks.stat2")}</div>
                  <p className="text-sm text-muted-foreground">{t("enterprise.sticks.stat2.label")}</p>
                </div>
              </Reveal>
            </div>
            <Reveal variant="fade" delay={180}>
              <p className="text-xs text-gold-dim italic mb-6">{t("enterprise.sticks.attribution")}</p>
            </Reveal>
            <Reveal variant="up" delay={240}>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">{t("enterprise.sticks.body")}</p>
            </Reveal>
          </div>
        </section>

        <section id="member-experience" className="section-padding">
          <div className="container max-w-4xl">
            <SectionHeader eyebrow={t("enterprise.member.eyebrow")} title={t("enterprise.member.title")} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MEMBER_BLOCKS.map((block, i) => (
                <Reveal key={block} variant={i === 0 ? "left" : "right"} delay={i * 100}>
                  <div className="premium-card-static p-8 h-full">
                    <h3 className="font-serif text-xl mb-4">{t(`enterprise.member.${block}.title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(`enterprise.member.${block}.body`)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface section-padding">
          <div className="container max-w-4xl">
            <SectionHeader eyebrow={t("enterprise.how.eyebrow")} title={t("enterprise.how.title")} />
            <div className="space-y-10">
              {HOW_STEPS.map((step, i) => (
                <Reveal key={step} variant="up" delay={i * 120}>
                  <div className="flex gap-6">
                    <span className="step-number">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-serif text-xl mb-3">{t(`enterprise.how.${step}.title`)}</h3>
                      <p className="text-muted-foreground leading-relaxed">{t(`enterprise.how.${step}.body`)}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container max-w-2xl text-center">
            <Reveal variant="up">
              <span className="eyebrow-pill mb-6">{t("enterprise.trust.eyebrow")}</span>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">{t("enterprise.trust.body")}</p>
              <Button onClick={() => window.open(CALENDLY_ENTERPRISE, "_blank")} variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12">
                {t("enterprise.trust.cta")}
              </Button>
            </Reveal>
          </div>
        </section>

        <section className="bg-surface section-padding gold-glow">
          <div className="container max-w-3xl text-center">
            <Reveal variant="scale">
              <h2 className="font-serif text-3xl md:text-5xl mb-6">{t("enterprise.finalCta.title")}</h2>
              <p className="text-lg text-muted-foreground mb-10">{t("enterprise.finalCta.subtitle")}</p>
              <Button onClick={() => window.open(CALENDLY_ENTERPRISE, "_blank")} className="bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full px-10 h-14 border-0">
                {t("enterprise.finalCta.cta")}
              </Button>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
