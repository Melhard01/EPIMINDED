"use client";

import type { CSSProperties } from "react";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const EASE = [0.16, 1, 0.3, 1] as const;

const TOKENS = {
  bg: "#0b0a08",
  title: "#efe9dc",
  stepTitle: "#e9e1d2",
  body: "#9b958b",
  gold: "#cba968",
  hairline: "rgba(203,169,104,.22)",
  numberGradient:
    "linear-gradient(155deg,#f3e6c7 0%,#d8b878 32%,#b8965e 58%,#8c6f43 100%)",
  display: '"Cormorant Garamond", Georgia, serif',
  bodyFont: '"Manrope", system-ui, sans-serif',
} as const;

const STEPS = [
  { key: "step1", display: "01" },
  { key: "step2", display: "02" },
  { key: "step3", display: "03" },
] as const;

const numberRevealVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const wordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: "0.36em",
    clipPath: "inset(105% 0 0 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0 0)",
    transition: { duration: 0.62, ease: EASE },
  },
};

const stepTitleWordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const stepsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 },
  },
};

const stepVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const bodyVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const dividerVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 0.75, ease: EASE },
  },
};

const descriptionVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};

function WordReveal({
  text,
  className,
  style,
  containerVariants = wordContainerVariants,
  itemVariants = wordVariants,
  centered = true,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  containerVariants?: Variants;
  itemVariants?: Variants;
  centered?: boolean;
}) {
  const words = text.split(" ").filter(Boolean);

  return (
    <motion.span
      className={`inline-flex flex-wrap ${centered ? "justify-center" : "justify-start"} ${className ?? ""}`}
      style={{ ...style, columnGap: "0.26em", rowGap: "0.12em" }}
      variants={containerVariants}
      aria-label={text}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={itemVariants}
          className="inline-block whitespace-nowrap"
          aria-hidden="true"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function StepNumber({
  display,
  reduceMotion,
}: {
  display: string;
  reduceMotion: boolean;
}) {
  const numberStyle: CSSProperties = {
    fontFamily: TOKENS.display,
    fontWeight: 600,
    fontSize: "clamp(96px, 11vw, 168px)",
    lineHeight: 1,
    background: TOKENS.numberGradient,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    fontVariantNumeric: "lining-nums tabular-nums",
  };

  if (reduceMotion) {
    return (
      <span className="lining-nums tabular-nums" style={numberStyle}>
        {display}
      </span>
    );
  }

  return (
    <motion.span
      className="partnership-odometer-wrap inline-block lining-nums tabular-nums transition-[filter] duration-500"
      style={numberStyle}
      variants={numberRevealVariants}
      aria-label={display}
    >
      {display}
    </motion.span>
  );
}

export default function PartnershipSection() {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();

  const sectionTitle = t("builders.partnership.title");
  const staircaseOffsets = ["0px", "70px", "150px"] as const;

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <style>{`
        @media (max-width: 899px) {
          .partnership-step-staircase {
            margin-top: 0 !important;
          }
        }
      `}</style>

      <motion.section
        id="partnership"
        className="partnership-section atmosphere-why-now relative overflow-hidden px-6 py-20 md:py-28"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="atmosphere-why-now__bg" aria-hidden="true">
          <span className="atmosphere-why-now__glow atmosphere-why-now__glow--a" />
          <span className="atmosphere-why-now__glow atmosphere-why-now__glow--b" />
        </div>
        <div className="atmosphere-why-now__grain" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-[1180px]">
          <div className="flex flex-col items-center text-center">
            <motion.span
              variants={badgeVariants}
              className="mb-6 inline-block rounded-full px-5 py-2 uppercase"
              style={{
                fontFamily: TOKENS.bodyFont,
                fontWeight: 600,
                fontSize: "11.5px",
                letterSpacing: "0.18em",
                color: TOKENS.gold,
                border: `1px solid ${TOKENS.hairline}`,
              }}
            >
              {t("builders.partnership.eyebrow")}
            </motion.span>

            <WordReveal
              text={sectionTitle}
              className="block max-w-[760px]"
              style={{
                fontFamily: TOKENS.display,
                fontWeight: 500,
                fontSize: "clamp(40px, 6vw, 64px)",
                lineHeight: 1.12,
                color: TOKENS.title,
              }}
            />
          </div>

          <motion.div
            className="mt-14 grid grid-cols-1 gap-10 min-[900px]:mt-16 min-[900px]:grid-cols-3 min-[900px]:gap-8"
            variants={stepsContainerVariants}
          >
            {STEPS.map((step, index) => (
              <motion.article
                key={step.key}
                variants={stepVariants}
                className="partnership-step-staircase group"
                style={{
                  marginTop: staircaseOffsets[index],
                }}
              >
                <StepNumber display={step.display} reduceMotion={!!reduceMotion} />

                <motion.div
                  className="mt-5 flex min-h-[clamp(13rem,28vh,17.5rem)] min-[900px]:mt-6"
                  variants={bodyVariants}
                >
                  <motion.div
                    variants={dividerVariants}
                    data-partnership-divider="true"
                    className="shrink-0 origin-top self-stretch transition-all duration-500"
                    style={{
                      width: "1px",
                      minHeight: "clamp(13rem, 28vh, 17.5rem)",
                      backgroundColor: TOKENS.hairline,
                      opacity: 0.72,
                      boxShadow: "0 0 0 rgba(203,169,104,0)",
                    }}
                    whileHover={undefined}
                  />

                  <div style={{ paddingLeft: "26px" }}>
                    <WordReveal
                      text={t(`builders.partnership.${step.key}.title`)}
                      containerVariants={stepTitleWordContainerVariants}
                      centered={false}
                      className="mb-3 block w-full"
                      style={{
                        fontFamily: TOKENS.display,
                        fontWeight: 500,
                        fontSize: "24px",
                        lineHeight: 1.2,
                        color: TOKENS.stepTitle,
                      }}
                    />

                    <motion.p
                      variants={descriptionVariants}
                      style={{
                        fontFamily: TOKENS.bodyFont,
                        fontWeight: 500,
                        fontSize: "15px",
                        lineHeight: 1.66,
                        color: TOKENS.body,
                        maxWidth: "300px",
                      }}
                      className="max-w-full min-[900px]:max-w-[300px]"
                    >
                      {t(`builders.partnership.${step.key}.body`)}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.article>
            ))}
          </motion.div>
        </div>

        <style>{`
          .group:hover .partnership-odometer-wrap {
            filter: drop-shadow(0 0 14px rgba(203, 169, 104, 0.28));
          }
          .group:hover [data-partnership-divider="true"] {
            opacity: 1 !important;
            box-shadow: 0 0 18px rgba(203, 169, 104, 0.22);
            background-color: rgba(203, 169, 104, 0.55);
          }
        `}</style>
      </motion.section>
    </MotionConfig>
  );
}
