import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  lenisInstance = lenis;
}

export function getLenis() {
  return lenisInstance;
}

type ScrollOptions = {
  immediate?: boolean;
  offset?: number;
};

/**
 * Section-to-section travel. Long enough to read as deliberate movement
 * rather than a jump, with an ease that leaves quickly and settles slowly
 * (easeOutQuart) so the landing feels soft instead of abrupt.
 */
const SECTION_DURATION = 1.15;
const SECTION_EASING = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Clearance for the fixed navbar comes from `scroll-margin-top` in the
 * stylesheet, not from an offset computed here. Lenis honours scroll-margin,
 * and so do native `scrollIntoView` and native anchor jumps, so one CSS
 * declaration covers every path. Applying an offset here as well double-counts
 * it and drops the section twice as far down as intended.
 */

export function smoothScrollToElement(element: HTMLElement, options: ScrollOptions = {}) {
  const { immediate = false, offset = 0 } = options;

  if (lenisInstance) {
    lenisInstance.scrollTo(element, {
      offset,
      immediate,
      ...(immediate
        ? {}
        : { duration: SECTION_DURATION, easing: SECTION_EASING }),
    });
    return true;
  }

  // No Lenis (reduced motion, or before the provider mounts). scrollIntoView
  // respects scroll-margin-top; window.scrollTo would not.
  if (offset === 0) {
    element.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    return true;
  }

  const top = element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  return true;
}

export function smoothScrollToId(id: string, options: ScrollOptions = {}) {
  const element = document.getElementById(id);
  if (!element) return false;
  return smoothScrollToElement(element, options);
}

export function smoothScrollToTop(immediate = false) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, {
      immediate,
      ...(immediate
        ? {}
        : { duration: SECTION_DURATION, easing: SECTION_EASING }),
    });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: immediate ? "auto" : "smooth" });
}
