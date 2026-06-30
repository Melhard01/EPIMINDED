"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const EASE = [0.16, 0.84, 0.36, 1] as const;

export default function EnterpriseCompletionSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.18 });
  const reduceMotion = useReducedMotion();
  const show = isInView || Boolean(reduceMotion);

  const textMotion = (delay: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 18 },
          animate: show ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
          transition: { duration: 0.85, delay, ease: EASE },
        };

  const bodyParagraphs = t("enterprise.completion.body").split("\n\n");

  return (
    <section
      ref={sectionRef}
      className="builders-ceiling-section enterprise-completion-section relative overflow-hidden"
    >
      <div className="builders-ceiling-section__bg" aria-hidden="true" />
      <div className="builders-ceiling-section__overlay" aria-hidden="true" />

      <div className="enterprise-completion__inner relative z-10">
        <motion.span
          className="eyebrow-pill enterprise-completion__eyebrow"
          {...textMotion(0.05)}
        >
          {t("enterprise.completion.eyebrow")}
        </motion.span>

        <div className="enterprise-completion__grid">
          <motion.h2 className="font-serif enterprise-completion__title" {...textMotion(0.18)}>
            {t("enterprise.completion.title")}
          </motion.h2>

          <motion.div className="enterprise-completion__copy" {...textMotion(0.3)}>
            {bodyParagraphs.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground enterprise-completion__body">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="enterprise-completion__figure"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.99 }}
          animate={
            show
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 28, scale: 0.99 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  opacity: { duration: 1.0, delay: 0.42, ease: EASE },
                  y: { duration: 1.1, delay: 0.42, ease: EASE },
                  scale: { duration: 1.1, delay: 0.42, ease: EASE },
                }
          }
        >
          <img
            src="/assets/enterprise-completion-meeting.png"
            alt={t("enterprise.completion.imageAlt")}
            width={1183}
            height={460}
            decoding="async"
            loading="lazy"
            className="enterprise-completion__image"
          />
        </motion.div>
      </div>
    </section>
  );
}
