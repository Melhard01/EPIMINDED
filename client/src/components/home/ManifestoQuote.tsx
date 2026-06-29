import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/reveal";

export default function ManifestoQuote() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface section-padding">
      <div className="container">
        <Reveal variant="fade" className="mx-auto max-w-[720px] text-center">
          <div className="border-y border-gold-dim/30 py-12 md:py-16 px-2">
            <span className="block font-serif text-5xl md:text-6xl text-gold-hero leading-none mb-6" aria-hidden="true">
              &ldquo;
            </span>
            <blockquote className="font-serif italic text-2xl md:text-[2rem] leading-snug text-foreground text-balance">
              {t("home.quote.text")}
            </blockquote>
            <p className="mt-8 text-sm uppercase tracking-[0.15em] text-gold-dim font-medium">
              {t("home.quote.attribution")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
