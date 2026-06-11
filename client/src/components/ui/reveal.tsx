import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  /** Skip animation — use for above-the-fold hero content */
  immediate?: boolean;
  /** Animate only the first time the element enters the viewport */
  once?: boolean;
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
};

function Reveal({
  children,
  className,
  delay = 0,
  duration = 800,
  variant = "up",
  immediate = false,
  once = false,
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, once]);

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
