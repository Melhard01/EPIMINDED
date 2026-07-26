import { Fragment, useEffect, useState } from "react";
import { Link } from "wouter";
import { clsx } from "@/funnel/lib/clsx";
import { CheckIcon } from "@/funnel/components/ui/icons";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className="inline-flex h-8 shrink-0 items-center lg:h-12" aria-label="SOULCHAIN">
      <img
        src="/assets/navbar-logo.png"
        alt="SOULCHAIN"
        className={clsx("h-8 w-auto object-contain lg:h-12 lg:max-h-12", className)}
      />
    </Link>
  );
}

const NAV = [
  ["For Founders", "/founders"],
  ["For Community Builders", "/community-builders"],
  ["For Organisations", "/enterprise"],
] as const;

export const ONBOARDING_STEPS = ["Profile", "Plan", "Open app"] as const;

export function OnboardingStepper({
  step,
  className,
}: {
  step: number;
  className?: string;
}) {
  return (
    <nav
      aria-label="Onboarding progress"
      className={clsx(
        "mx-auto flex w-full max-w-[1180px] items-center justify-center gap-1.5 px-6 pb-3 pt-16 sm:gap-2.5 sm:pt-20",
        className,
      )}
    >
      {ONBOARDING_STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <span
                aria-hidden
                className={clsx(
                  "h-[2px] w-10 transition-colors sm:w-16",
                  i <= step ? "bg-gold" : "bg-line",
                )}
              />
            )}
            <span className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={clsx(
                  "grid h-6 w-6 flex-none place-items-center rounded-full border font-mono text-[11px] transition-colors",
                  done && "border-gold bg-gold text-[#15110A]",
                  active && "border-gold text-gold",
                  !done && !active && "border-white/80 text-white",
                )}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={clsx(
                  "font-mono text-[12px] uppercase tracking-label transition-colors",
                  active
                    ? "text-gold"
                    : done
                      ? "text-body hidden sm:inline"
                      : "text-white/80 hidden sm:inline",
                )}
              >
                {label}
              </span>
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}

function readScrollTop() {
  if (typeof window === "undefined") return 0;
  return (
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

export function BrandHeader({
  full = false,
  step,
  sticky = true,
  stepperClassName,
}: {
  full?: boolean;
  step?: number;
  sticky?: boolean;
  stepperClassName?: string;
}) {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (!sticky) {
      setAtTop(true);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      setAtTop(readScrollTop() <= 12);
    };
    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sticky]);

  return (
    <>
      <header
        className={clsx(
          "z-50 w-full transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300",
          sticky ? "sticky top-0" : "relative",
          atTop
            ? "border-b border-transparent bg-transparent shadow-none backdrop-blur-none"
            : "border-b border-line/50 bg-[rgba(0,0,0,0.88)] shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <div
          className={clsx(
            "mx-auto flex w-full max-w-[1180px] items-center px-6 py-3 lg:py-4",
            full ? "justify-between" : "justify-start",
          )}
        >
          <Wordmark />
          {full && (
            <nav className="hidden items-center gap-8 text-[15px] text-paper md:flex">
              {NAV.map(([label, href], i) => (
                <Link key={i} href={href} className="transition hover:text-gold">
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      {typeof step === "number" && (
        <OnboardingStepper step={step} className={stepperClassName} />
      )}
    </>
  );
}
