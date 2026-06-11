import { useLanguage } from "@/contexts/LanguageContext";
import Reveal from "@/components/ui/reveal";

const PORTRAIT_COUNT = 7;

export default function TrustBand() {
  const { t } = useLanguage();

  return (
    <section className="trust-band bg-surface border-y border-border/60">
      <div className="container">
        <div className="trust-band-layout">
          <Reveal variant="left" className="trust-band-left">
            <div className="trust-avatar-pile" aria-hidden="true">
              {Array.from({ length: PORTRAIT_COUNT }).map((_, i) => (
                <div key={i} className="trust-portrait" style={{ zIndex: PORTRAIT_COUNT - i }} />
              ))}
            </div>
            <p className="trust-band-label">{t("trust.label")}</p>
          </Reveal>

          <div className="trust-band-divider" aria-hidden="true" />

          <Reveal variant="right" delay={150} className="trust-band-right">
            <p className="trust-band-stat-primary">{t("trust.stat1")}</p>
            <p className="trust-band-stat-secondary">{t("trust.stat2")}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
