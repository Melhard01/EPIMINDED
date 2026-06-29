"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "./FoundersFirst.module.css";

const EASE_CINEMA = [0.17, 0.67, 0.3, 1] as const;
const EASE_SOFT = [0.16, 0.84, 0.36, 1] as const;
const PARALLAX_MAX = 14;

function splitParagraphWithHighlight(text: string, highlight: string) {
  const index = text.indexOf(highlight);
  if (index === -1) {
    return { before: text, highlight: "", after: "" };
  }
  return {
    before: text.slice(0, index),
    highlight,
    after: text.slice(index + highlight.length),
  };
}

export default function FoundersFirst() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const { t } = useLanguage();

  const [isMobile, setIsMobile] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  const parallaxX = useSpring(0, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(0, { stiffness: 60, damping: 20 });
  const lineParallaxX = useSpring(0, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 900px)");
    const mqPointer = window.matchMedia("(pointer: fine)");

    const update = () => {
      setIsMobile(mqMobile.matches);
      setFinePointer(mqPointer.matches);
    };

    update();
    mqMobile.addEventListener("change", update);
    mqPointer.addEventListener("change", update);

    return () => {
      mqMobile.removeEventListener("change", update);
      mqPointer.removeEventListener("change", update);
    };
  }, []);

  const shouldAnimate = isInView || Boolean(reducedMotion);
  const showTravelingGlow = isInView && !reducedMotion && !isMobile;

  const title = t("whyFounders.title");
  const titleText = title.endsWith(".") ? title.slice(0, -1) : title;

  const paragraphs = useMemo(() => t("whyFounders.body").split("\n\n"), [t]);
  const highlight = t("whyFounders.highlight");
  const paragraphOne = splitParagraphWithHighlight(paragraphs[0] ?? "", highlight);
  const paragraphTwo = paragraphs[1] ?? "";

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (reducedMotion || !finePointer || isMobile || !sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;

      parallaxX.set(-nx * PARALLAX_MAX);
      parallaxY.set(-ny * PARALLAX_MAX * 0.6);
      lineParallaxX.set(nx * PARALLAX_MAX * 0.4);
    },
    [finePointer, isMobile, lineParallaxX, parallaxX, parallaxY, reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    parallaxX.set(0);
    parallaxY.set(0);
    lineParallaxX.set(0);
  }, [lineParallaxX, parallaxX, parallaxY]);

  const enableParallax = !reducedMotion && finePointer && !isMobile;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="founders-first-title"
      onMouseMove={enableParallax ? handleMouseMove : undefined}
      onMouseLeave={enableParallax ? handleMouseLeave : undefined}
    >
      <motion.div
        className={styles.photoWrapper}
        style={enableParallax ? { x: parallaxX, y: parallaxY } : undefined}
      >
        <motion.img
          src="/founders-bg.jpg"
          alt="An executive looking out over the city at dusk, a meeting visible through the glass."
          className={styles.photo}
          width={1920}
          height={1080}
          decoding="async"
          loading="lazy"
          initial={
            reducedMotion
              ? { scale: 1, opacity: 1 }
              : { scale: 1.09, opacity: 0 }
          }
          animate={
            shouldAnimate
              ? { scale: 1, opacity: 1 }
              : { scale: 1.09, opacity: 0 }
          }
          transition={{
            scale: { duration: 2.6, ease: EASE_CINEMA },
            opacity: { duration: 1.5, ease: EASE_CINEMA },
          }}
        />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
      </motion.div>

      {!isMobile ? (
        <motion.div
          className={styles.signatureLine}
          aria-hidden="true"
          style={enableParallax ? { x: lineParallaxX } : undefined}
          initial={reducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
          animate={shouldAnimate ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.15, delay: 0.15, ease: EASE_SOFT }}
        >
          {showTravelingGlow ? (
            <motion.div
              className={styles.travelingGlow}
              animate={{
                top: ["-6%", "96%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.3,
              }}
            />
          ) : null}
        </motion.div>
      ) : null}

      <div className={styles.content}>
        <div className={styles.inner}>
          {isMobile ? (
            <motion.div
              className={styles.mobileTick}
              aria-hidden="true"
              initial={reducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
              animate={shouldAnimate ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.15, delay: 0.15, ease: EASE_SOFT }}
            />
          ) : null}

          <motion.span
            className={styles.eyebrow}
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.85, delay: 0.35, ease: EASE_SOFT }}
          >
            {t("whyFounders.eyebrow")}
          </motion.span>

          <motion.h2
            id="founders-first-title"
            className={`${styles.headline} font-serif text-3xl md:text-4xl lg:text-5xl leading-tight`}
            initial={
              reducedMotion
                ? { opacity: 1, y: 0, clipPath: "inset(0 -12% -12% -12%)" }
                : {
                    opacity: 0,
                    y: 26,
                    clipPath: "inset(0 -12% 108% -12%)",
                  }
            }
            animate={
              shouldAnimate
                ? { opacity: 1, y: 0, clipPath: "inset(0 -12% -12% -12%)" }
                : {
                    opacity: 0,
                    y: 26,
                    clipPath: "inset(0 -12% 108% -12%)",
                  }
            }
            transition={{ duration: 1.05, delay: 0.5, ease: EASE_SOFT }}
          >
            {titleText}
            <span className={styles.headlinePeriod}>.</span>
          </motion.h2>

          <motion.p
            className={styles.body}
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            transition={{ duration: 0.9, delay: 0.72, ease: EASE_SOFT }}
          >
            {paragraphOne.before}
            {paragraphOne.highlight ? (
              <span className={styles.highlight}>{paragraphOne.highlight}</span>
            ) : null}
            {paragraphOne.after}
          </motion.p>

          <motion.p
            className={styles.body}
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            animate={
              shouldAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }
            }
            transition={{ duration: 0.9, delay: 0.92, ease: EASE_SOFT }}
          >
            {paragraphTwo}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
