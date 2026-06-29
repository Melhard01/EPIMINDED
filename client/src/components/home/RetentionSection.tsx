import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./RetentionSection.module.css";

export default function RetentionSection() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.28 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="market-proof"
      className={`${styles.retention} ${inView ? styles.isIn : ""}`}
      aria-label="Why daily habit and peer presence works"
    >
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.inner}>
        <span className={`${styles.eyebrow} ${styles.reveal}`} data-d="1">
          {t("home.proof.eyebrow")}
        </span>

        <h2 className={`${styles.headline} ${styles.reveal}`} data-d="2">
          {t("home.proof.headlineLead")}
          <em>{t("home.proof.headlineEm")}</em>
        </h2>

        <div className={styles.stats}>
          <div className={`${styles.stat} ${styles.win} ${styles.reveal}`} data-d="3">
            <div className={styles.num}>
              {t("home.proof.stat1.range")}
              <span className={styles.pct}>%</span>
            </div>
            <div className={styles.meter} aria-hidden="true">
              <i style={{ "--fill": "90%" } as CSSProperties} />
            </div>
            <p className={styles.label}>{t("home.proof.stat1.label")}</p>
          </div>

          <div className={`${styles.divider} ${styles.reveal}`} data-d="3" aria-hidden="true">
            <span className={styles.rule} />
            <span className={styles.vs}>vs</span>
            <span className={styles.rule} />
          </div>

          <div className={`${styles.stat} ${styles.lose} ${styles.reveal}`} data-d="4">
            <div className={styles.num}>
              {t("home.proof.stat2.range")}
              <span className={styles.pct}>%</span>
            </div>
            <div className={styles.meter} aria-hidden="true">
              <i style={{ "--fill": "15%" } as CSSProperties} />
            </div>
            <p className={styles.label}>{t("home.proof.stat2.label")}</p>
          </div>
        </div>

        <p className={`${styles.cite} ${styles.reveal}`} data-d="5">
          {t("home.proof.citation")}
        </p>

        <p className={`${styles.body} ${styles.reveal}`} data-d="5">
          {t("home.proof.bodyLead")}
          <strong>{t("home.proof.bodyStrong")}</strong>
          {t("home.proof.bodyTail")}
        </p>
      </div>
    </section>
  );
}
