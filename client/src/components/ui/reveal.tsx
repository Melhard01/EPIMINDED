import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade" | "rise";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  /** Skip animation — use for above-the-fold hero content */
  immediate?: boolean;
  /**
   * Re-run the animation every time the element re-enters the viewport.
   * Off by default: re-animating on every scroll pass reads as flickering,
   * and an element resting near the observer threshold toggles repeatedly
   * while Lenis eases the scroll to a stop.
   */
  repeat?: boolean;
}

const variantClasses: Record<RevealVariant, { hidden: string; visible: string }> = {
  up: {
    hidden: "opacity-0 translate-y-8 blur-[2px]",
    visible: "opacity-100 translate-y-0 blur-0",
  },
  down: {
    hidden: "opacity-0 -translate-y-8 blur-[2px]",
    visible: "opacity-100 translate-y-0 blur-0",
  },
  left: {
    hidden: "opacity-0 -translate-x-8 blur-[2px]",
    visible: "opacity-100 translate-x-0 blur-0",
  },
  right: {
    hidden: "opacity-0 translate-x-8 blur-[2px]",
    visible: "opacity-100 translate-x-0 blur-0",
  },
  scale: {
    hidden: "opacity-0 scale-[0.96] blur-[2px]",
    visible: "opacity-100 scale-100 blur-0",
  },
  fade: {
    hidden: "opacity-0",
    visible: "opacity-100",
  },
  rise: {
    hidden: "opacity-0 translate-y-16",
    visible: "opacity-100 translate-y-0",
  },
};

function Reveal({
  children,
  className,
  delay = 0,
  duration = 800,
  variant = "up",
  immediate = false,
  repeat = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) return;

    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    // IntersectionObserver is Safari 12.1+. Without it there is nothing to
    // reveal the element, so it would stay at opacity 0 — the content would
    // simply be missing. Show it immediately instead: no entry animation, but
    // the page reads normally, which is the same trade reduced motion makes.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (!repeat) observer.disconnect();
        } else if (repeat) {
          setVisible(false);
        }
      },
      // Several thresholds so the callback does not hinge on crossing one
      // exact ratio, which is what makes a boundary-parked element stutter.
      { threshold: [0, 0.08, 0.16], rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, repeat]);

  const motion = variantClasses[variant];

  return (
    <div
      ref={ref}
      className={cn(
        !immediate && "reveal-motion will-change-[opacity,transform,filter]",
        !immediate && (visible ? motion.visible : motion.hidden),
        className
      )}
      style={
        immediate
          ? undefined
          : {
              transitionDelay: `${delay}ms`,
              transitionDuration: `${duration}ms`,
            }
      }
    >
      {children}
    </div>
  );
}

export default Reveal;
export { Reveal };
