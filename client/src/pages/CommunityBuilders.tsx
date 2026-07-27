import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/shared/SectionHeader";
import Reveal from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import PartnerSection from "@/components/PartnerSection";
import PartnershipSection from "@/components/PartnershipSection";
import BringAccordionItem from "@/components/shared/BringAccordionItem";
import { smoothScrollToId } from "@/lib/smoothScroll";

const Aurora = lazy(() => import("@/components/effects/Aurora"));

const AURORA_COLOR_STOPS = ["#8b7632", "#c6a15b", "#ffffff"] as const;

const BRING_TEXT_CARDS = ["card1", "card2", "card3"] as const;
const WORKS_ITEMS = ["item1", "item2", "item3", "item4"] as const;
const DOESNT_ITEMS = ["item1", "item2", "item3", "item4"] as const;

export default function CommunityBuilders() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const scrollToPartnership = () => {
    smoothScrollToId("partnership");
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <Navbar />
      <main>
        <section
          id="for-community-builders"
          className="builders-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
        >
          <div className="builders-hero__bg" aria-hidden="true">
            <Suspense fallback={null}>
              <Aurora
                colorStops={[...AURORA_COLOR_STOPS]}
                blend={0.61}
                amplitude={1.0}
                speed={1.2}
              />
            </Suspense>
          </div>
          <div className="builders-hero__overlay" aria-hidden="true" />
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
                    type="button"
                    onClick={() => setLocation("/quiz")}
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

        <section className="builders-ceiling-section atmosphere-why-now section-padding relative overflow-hidden">
          <div className="atmosphere-why-now__bg" aria-hidden="true">
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
          </div>
          <div className="atmosphere-why-now__grain" aria-hidden="true" />

          <div className="container relative z-10 max-w-5xl">
            <Reveal variant="fade" className="text-center">
              <span className="eyebrow-pill mb-6 md:mb-8 inline-block">{t("builders.ceiling.eyebrow")}</span>
            </Reveal>

            <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
              <Reveal variant="up" delay={80} className="md:col-span-5">
                <h2 className="font-serif text-4xl md:text-4xl lg:text-5xl leading-snug">
                  {t("builders.ceiling.title")}
                </h2>
              </Reveal>

              <div className="md:col-span-7 space-y-6">
                {t("builders.ceiling.body")
                  .split("\n\n")
                  .map((paragraph, i) => (
                    <Reveal key={i} variant="up" delay={120 + i * 100}>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    </Reveal>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section className="builders-bring builders-bring--community atmosphere-why-now section-padding relative overflow-hidden">
          <div className="atmosphere-why-now__bg" aria-hidden="true">
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
          </div>
          <div className="atmosphere-why-now__grain" aria-hidden="true" />

          <div className="container relative z-10">
            <SectionHeader eyebrow={t("builders.bring.eyebrow")} title={t("builders.bring.title")} />

            <div className="builders-bring__layout">
              <Reveal variant="up" delay={80} className="builders-bring__media">
                <div className="builders-bring__image-wrap">
                  <img
                    src="/assets/builders-bring-phones.png"
                    alt={t("builders.bring.imageAlt")}
                    width={1563}
                    height={1563}
                    decoding="async"
                    loading="lazy"
                    className="builders-bring__image"
                  />
                </div>
              </Reveal>

              <div className="builders-bring__copy">
                {BRING_TEXT_CARDS.map((card, i) => (
                  <Reveal key={card} variant="up" delay={120 + i * 100}>
                    <div className="builders-bring__content">
                      <BringAccordionItem
                        title={t(`builders.bring.${card}.title`)}
                        body={t(`builders.bring.${card}.body`)}
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PartnershipSection />

        <section className="builders-fit-section atmosphere-why-now section-padding relative overflow-hidden">
          <div className="atmosphere-why-now__bg" aria-hidden="true">
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
            <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
          </div>
          <div className="atmosphere-why-now__grain" aria-hidden="true" />

          <div className="container relative z-10 max-w-6xl">
            <SectionHeader eyebrow={t("builders.fit.eyebrow")} title={t("builders.fit.title")} />

            <div className="builders-fit__layout">
              <Reveal variant="left" className="builders-fit__media">
                <div className="builders-fit__image-wrap">
                  <img
                    src="/assets/builders-fit-image.png"
                    alt={t("builders.fit.imageAlt")}
                    width={500}
                    height={500}
                    decoding="async"
                    loading="lazy"
                    className="builders-fit__image"
                  />
                </div>
              </Reveal>

              <div className="builders-fit__cards">
                <Reveal variant="right">
                  <div className="builders-fit__card">
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
                  <div className="builders-fit__card">
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
          </div>
        </section>

        <PartnerSection />
      </main>
      <Footer />
    </div>
  );
}
