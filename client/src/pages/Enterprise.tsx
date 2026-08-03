import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/shared/SectionHeader";
import BringAccordionItem from "@/components/shared/BringAccordionItem";
import EnterpriseCompletionSection from "@/components/EnterpriseCompletionSection";
import EnterpriseHowSection from "@/components/EnterpriseHowSection";
import Reveal from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import RequestCommunityForm from "@/components/RequestCommunityForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { smoothScrollToId } from "@/lib/smoothScroll";

const Grainient = lazy(() => import("@/components/effects/Grainient"));

const BRING_CARDS = ["card1", "card2", "card3"] as const;
const LEFT_MEMBER_CARDS = ["card2", "card4"] as const;
const RIGHT_MEMBER_CARDS = ["card1", "card3"] as const;

type MemberCardKey = (typeof LEFT_MEMBER_CARDS)[number] | (typeof RIGHT_MEMBER_CARDS)[number];

function MemberCard({ cardKey, index }: { cardKey: MemberCardKey; index: number }) {
  const { t } = useLanguage();

  return (
    <Reveal
      variant={index % 2 === 0 ? "scale" : "up"}
      delay={index * 100}
      className={`what-we-bring__card what-we-bring__card--${cardKey}`}
    >
      <div className="what-we-bring__content">
        <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-4">{t(`enterprise.member.${cardKey}.title`)}</h3>
        <p className="text-muted-foreground leading-relaxed">{t(`enterprise.member.${cardKey}.body`)}</p>
      </div>
    </Reveal>
  );
}

export default function Enterprise() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const scrollToMember = () => {
    smoothScrollToId("member-experience");
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <Navbar />
      <main>
        <section
          id="for-organisations"
          className="enterprise-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
        >
          <div className="enterprise-hero__bg" aria-hidden="true">
            <Suspense fallback={null}>
              <Grainient
                color1="#ecc374"
                color2="#000000"
                color3="#cfc497"
                timeSpeed={0.25}
                colorBalance={0.0}
                warpStrength={1.0}
                warpFrequency={5.0}
                warpSpeed={2.0}
                warpAmplitude={50.0}
                blendAngle={0.0}
                blendSoftness={0.05}
                rotationAmount={500.0}
                noiseScale={2.0}
                grainAmount={0.1}
                grainScale={2.0}
                grainAnimated={false}
                contrast={1.5}
                gamma={1.0}
                saturation={1.0}
                centerX={0.0}
                centerY={0.0}
                zoom={0.9}
              />
            </Suspense>
          </div>
          <div className="enterprise-hero__overlay" aria-hidden="true" />

          <div className="container relative z-10 px-4 sm:px-6">
            <div className="hero-content max-w-4xl mx-auto text-center">
              <Reveal variant="rise" delay={0} duration={1100}>
                <span className="eyebrow-pill hero-eyebrow">{t("enterprise.hero.eyebrow")}</span>
              </Reveal>
              <Reveal variant="rise" delay={120} duration={1100}>
                <h1 className="font-serif hero-headline text-balance">
                  {t("enterprise.hero.title")}
                </h1>
              </Reveal>
              <Reveal variant="rise" delay={240} duration={1100}>
                <p className="hero-subtitle text-muted-foreground text-balance">
                  {t("enterprise.hero.subtitle")}
                </p>
              </Reveal>
              <Reveal variant="rise" delay={360} duration={1100}>
                <div className="hero-cta">
                  <Button
                    type="button"
                    onClick={() => setLocation("/quiz")}
                    className="hero-cta-btn bg-gold text-[#0E0E0E] hover:bg-gold/90 rounded-full border-0"
                  >
                    {t("enterprise.hero.cta.primary")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={scrollToMember}
                    className="hero-cta-btn border-white/30 text-white hover:bg-white/10 rounded-full"
                  >
                    {t("enterprise.hero.cta.secondary")}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <EnterpriseCompletionSection />

        <section className="builders-bring enterprise-bring-section atmosphere-why-now pt-28 md:pt-36 lg:pt-44 pb-24 md:pb-32 lg:pb-40 relative overflow-hidden">
          <div className="atmosphere-why-now__bg" aria-hidden="true">
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
          </div>
          <div className="atmosphere-why-now__grain" aria-hidden="true" />

          <div className="container relative z-10">
            <SectionHeader eyebrow={t("enterprise.bring.eyebrow")} title={t("enterprise.bring.title")} />

            <div className="builders-bring__layout builders-bring__layout--media-right">
              <div className="builders-bring__copy">
                {BRING_CARDS.map((card, i) => (
                  <Reveal key={card} variant="up" delay={120 + i * 100}>
                    <div className="builders-bring__content">
                      <BringAccordionItem
                        title={t(`enterprise.bring.${card}.title`)}
                        subtitle={t(`enterprise.bring.${card}.subtitle`)}
                        body={t(`enterprise.bring.${card}.body`)}
                      />
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal variant="up" delay={80} className="builders-bring__media">
                <div className="builders-bring__image-wrap">
                  <img
                    src="/assets/builders-bring-phones.png"
                    alt={t("enterprise.bring.imageAlt")}
                    width={1563}
                    height={1563}
                    decoding="async"
                    loading="lazy"
                    className="builders-bring__image"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="member-experience" className="enterprise-member-section atmosphere-why-now section-padding relative overflow-hidden">
          <div className="atmosphere-why-now__bg" aria-hidden="true">
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
          </div>
          <div className="atmosphere-why-now__grain" aria-hidden="true" />

          <div className="container relative z-10">
            <SectionHeader eyebrow={t("enterprise.member.eyebrow")} title={t("enterprise.member.title")} />

            <div className="what-we-bring__layout">
              <div className="what-we-bring__cards what-we-bring__cards--left">
                {LEFT_MEMBER_CARDS.map((card, i) => (
                  <MemberCard key={card} cardKey={card} index={i + 1} />
                ))}
              </div>

              <div className="what-we-bring__divider" aria-hidden="true" />

              <div className="what-we-bring__cards what-we-bring__cards--right">
                {RIGHT_MEMBER_CARDS.map((card, i) => (
                  <MemberCard key={card} cardKey={card} index={i * 2} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <EnterpriseHowSection />

        <section id="apply" className="founder-cohort-section section-padding">
          <div className="founder-cohort-section__bg" aria-hidden="true" />
          <div className="founder-cohort-section__overlay" aria-hidden="true" />

          <div className="container relative z-10 max-w-4xl mx-auto">
            <Reveal variant="up" className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-balance max-w-[720px] mx-auto mb-6">
                {t("finalCta.title")}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t("finalCta.subtitle")}
              </p>
            </Reveal>

            <Reveal variant="scale" delay={120}>
              <RequestCommunityForm wide showHeader />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
