import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Reveal } from "@/components/ui/reveal";
import { ArrowRight } from "lucide-react";

export default function Organisations() {
  const { t } = useLanguage();

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="section-divider absolute top-0" />
      <div className="absolute inset-0 gold-glow opacity-40 pointer-events-none" />

      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center max-w-5xl mx-auto">
          <Reveal className="lg:col-span-7 space-y-6">
            <span className="eyebrow-pill">{t("organisations.eyebrow")}</span>
            <h2 className="font-serif text-3xl md:text-5xl text-foreground leading-tight mt-6">
              {t("organisations.title")}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              {t("organisations.body")}
            </p>
          </Reveal>

          <Reveal className="lg:col-span-5" delay={0.1}>
            <div className="premium-card-static p-8 md:p-10 flex flex-col items-start lg:items-end gap-6">
              <Link href="/enterprise">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-12 px-8 text-base border-0 group">
                  {t("organisations.cta")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a
                href="mailto:support@epiminded.com"
                className="text-sm text-muted-foreground hover:text-gold transition-colors"
              >
                {t("organisations.talk")}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
