import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./StatCalloutGrid.module.css";

export type StatCalloutItem = {
  metric: string;
  caption: string;
  title: string;
  body: string;
};

type StatCalloutGridProps = {
  items: StatCalloutItem[];
};

const STAGGER = ["0s", "0.12s", "0.24s"] as const;

export default function StatCalloutGrid({ items }: StatCalloutGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.grid} ${inView ? styles.isIn : ""}`}>
      {items.length === 3 && (
        <>
          <span className={`${styles.divider} ${styles.d1}`} aria-hidden="true" />
          <span className={`${styles.divider} ${styles.d2}`} aria-hidden="true" />
        </>
      )}

      {items.map((item, i) => (
        <article
          key={item.metric}
          className={styles.col}
          style={{ "--cd": STAGGER[i] ?? "0s" } as CSSProperties}
        >
          <div className={styles.numwrap}>
            <span className={styles.numglow} aria-hidden="true" />
            <span className={styles.nummask}>
              <span className={styles.num}>{item.metric}</span>
            </span>
          </div>
          <span className={styles.cap}>{item.caption}</span>
          <span className={styles.rule} aria-hidden="true" />
          <h3 className={styles.sub}>{item.title}</h3>
          <p className={styles.body}>{item.body}</p>
        </article>
      ))}
    </div>
  );
}
