import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/shared/SectionHeader";
import BringAccordionItem from "@/components/shared/BringAccordionItem";
import EnterpriseHowSection from "@/components/EnterpriseHowSection";
import Reveal from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { CALENDLY_ENTERPRISE } from "@/lib/urls";
import { smoothScrollToId } from "@/lib/smoothScroll";

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
          <div className="enterprise-hero__bg" aria-hidden="true" />
          <div className="enterprise-hero__overlay" aria-hidden="true" />

          <div className="container relative z-10 px-4 sm:px-6">
            <div className="hero-content max-w-4xl mx-auto text-center">
              <Reveal immediate>
                <span className="eyebrow-pill hero-eyebrow">{t("enterprise.hero.eyebrow")}</span>
              </Reveal>
              <Reveal immediate>
                <h1 className="font-serif hero-headline text-balance">
                  {t("enterprise.hero.title")}
                </h1>
              </Reveal>
              <Reveal immediate>
                <p className="hero-subtitle text-muted-foreground text-balance">
                  {t("enterprise.hero.subtitle")}
                </p>
              </Reveal>
              <Reveal immediate>
                <div className="hero-cta">
                  <Button
                    onClick={() => window.open(CALENDLY_ENTERPRISE, "_blank")}
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

        <section className="builders-ceiling-section enterprise-completion-section pt-24 md:pt-32 lg:pt-40 relative overflow-hidden">
          <div className="builders-ceiling-section__bg" aria-hidden="true" />
          <div className="builders-ceiling-section__overlay" aria-hidden="true" />

          <div className="container relative z-10 max-w-5xl">
            <Reveal variant="fade" className="text-center">
              <span className="eyebrow-pill mb-6 md:mb-8 inline-block">{t("enterprise.completion.eyebrow")}</span>
            </Reveal>

            <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-start">
              <Reveal variant="up" delay={80} className="md:col-span-5">
                <h2 className="font-serif text-4xl md:text-4xl lg:text-5xl leading-snug">
                  {t("enterprise.completion.title")}
                </h2>
              </Reveal>

              <div className="md:col-span-7 space-y-6">
                {t("enterprise.completion.body")
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

          <div className="enterprise-completion__image-outer relative z-10">
            <Reveal variant="up" delay={200} className="w-full">
              <img
                src="/assets/enterprise-completion-meeting.png"
                alt={t("enterprise.completion.imageAlt")}
                width={1200}
                height={675}
                decoding="async"
                loading="lazy"
                className="enterprise-completion__image"
              />
            </Reveal>
          </div>
        </section>

        <section className="builders-bring enterprise-bring-section pt-28 md:pt-36 lg:pt-44 pb-24 md:pb-32 lg:pb-40 relative overflow-hidden">
          <div className="enterprise-bring-section__bg" aria-hidden="true" />
          <div className="enterprise-bring-section__overlay" aria-hidden="true" />

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

        <section id="member-experience" className="enterprise-member-section section-padding relative overflow-hidden">
          <div className="enterprise-member-section__bg" aria-hidden="true" />
          <div className="enterprise-member-section__overlay" aria-hidden="true" />

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

        <section className="enterprise-final-cta-section section-padding relative overflow-hidden">
          <div className="enterprise-final-cta-section__bg" aria-hidden="true" />
          <div className="enterprise-final-cta-section__overlay" aria-hidden="true" />

          <div className="container relative z-10 max-w-3xl text-center">
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
