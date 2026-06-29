import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./WhyNow.module.css";

const COLS = [
  { key: "col1" as const, cd: "0s" },
  { key: "col2" as const, cd: "0.12s" },
  { key: "col3" as const, cd: "0.24s" },
];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function useCountUp(target: number, start: boolean, delay = 0, duration = 1250) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (!start) {
      if (!prefersReducedMotion()) {
        setValue(0);
      }
      return;
    }
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    let raf = 0;
    let t0: number | null = null;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      if (t0 === null) t0 = now;
      const p = Math.min((now - t0) / duration, 1);
      setValue(Math.round(ease(p) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    const id = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(id);
      cancelAnimationFrame(raf);
    };
  }, [start, target, delay, duration]);

  return value;
}

export default function WhyNow() {
  const { t, language } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  const v20 = useCountUp(20, inView, 700);
  const v55 = useCountUp(55, inView, 820);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const renderNumber = (colKey: (typeof COLS)[number]["key"]) => {
    if (colKey === "col1") {
      return language === "fr" ? `${v20}$` : `$${v20}`;
    }
    if (colKey === "col2") {
      return `${v55}%`;
    }
    return t(`home.whynow.${colKey}.stat`);
  };

  return (
    <section
      ref={ref}
      id="why-now"
      className={`${styles.why} ${inView ? styles.isIn : ""}`}
      aria-labelledby="why-title"
    >
      <div className={styles.bg} aria-hidden="true">
        <span className={`${styles.glow} ${styles.glowA}`} />
        <span className={`${styles.glow} ${styles.glowB}`} />
      </div>

      <div className={styles.inner}>
        <span className={styles.eyebrow}>{t("home.whynow.eyebrow")}</span>
        <h2 id="why-title" className={styles.title}>
          {t("home.whynow.title")}
        </h2>
        <span className={styles.titlerule} aria-hidden="true" />

        <div className={styles.grid}>
          <span className={`${styles.divider} ${styles.d1}`} aria-hidden="true" />
          <span className={`${styles.divider} ${styles.d2}`} aria-hidden="true" />

          {COLS.map(({ key, cd }) => (
            <article key={key} className={styles.col} style={{ "--cd": cd } as CSSProperties}>
              <div className={styles.numwrap}>
                <span className={styles.numglow} aria-hidden="true" />
                <span className={styles.nummask}>
                  <span className={styles.num}>{renderNumber(key)}</span>
                </span>
              </div>
              <span className={styles.cap}>{t(`home.whynow.${key}.caption`)}</span>
              <span className={styles.rule} aria-hidden="true" />
              <h3 className={styles.sub}>{t(`home.whynow.${key}.title`)}</h3>
              <p className={styles.body}>{t(`home.whynow.${key}.body`)}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.grain} aria-hidden="true" />
    </section>
  );
}
