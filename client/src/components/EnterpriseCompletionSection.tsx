"use client";

import { useMemo, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./EnterpriseCompletionSection.module.css";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function revealClass(visible: boolean, reduceMotion: boolean, delayClass: string) {
  if (reduceMotion) return "";
  return cn(styles.reveal, visible && styles.revealVisible, delayClass);
}

function formatTitle(title: string) {
  const en = title.match(
    /^(Your LMS is full\.)\s+(Your completion rates are )\b(not)\.?$/i,
  );
  if (en) {
    return (
      <>
        {en[1]}
        <br className={styles.titleBr} aria-hidden="true" /> {en[2]}
        <em className={styles.titleAccent}>{en[3]}</em>.
      </>
    );
  }

  const fr = title.match(/^(Votre LMS est plein\.)\s+(Pas)( vos taux d'achèvement\.?)$/i);
  if (fr) {
    return (
      <>
        {fr[1]}
        <br className={styles.titleBr} aria-hidden="true" /> <em className={styles.titleAccent}>{fr[2]}</em>
        {fr[3]}
      </>
    );
  }

  return title;
}

export default function EnterpriseCompletionSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.18 });
  const reduceMotion = useReducedMotion();
  const visible = isInView || Boolean(reduceMotion);

  const title = t("enterprise.completion.title");
  const body = useMemo(
    () => t("enterprise.completion.body").replace(/\s*\n+\s*/g, " ").trim(),
    [t],
  );

  return (
    <section ref={sectionRef} className={styles.section} id="where-it-gets-hard">
      <div className={styles.shell}>
        <div className={styles.grid}>
          <header className={styles.header}>
            <p className={cn(styles.eyebrowRow, revealClass(visible, Boolean(reduceMotion), styles.delay0))}>
              <span className="eyebrow-pill">{t("enterprise.completion.eyebrow")}</span>
            </p>
          </header>

          <h2 className={cn(styles.title, revealClass(visible, Boolean(reduceMotion), styles.delay80))}>
            {formatTitle(title)}
          </h2>

          <div className={cn(styles.copy, revealClass(visible, Boolean(reduceMotion), styles.delay180))}>
            <p className={styles.body}>{body}</p>
          </div>

          <figure className={cn(styles.figure, revealClass(visible, Boolean(reduceMotion), styles.delay260))}>
            <div className={styles.mediaFrame}>
              <img
                src="/assets/enterprise-completion-meeting.png"
                alt={t("enterprise.completion.imageAlt")}
                width={1183}
                height={460}
                decoding="async"
                loading="lazy"
                className={styles.image}
              />
              <div className={styles.mediaOverlay} aria-hidden="true" />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
