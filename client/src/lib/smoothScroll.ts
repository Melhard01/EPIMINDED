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

export function smoothScrollToElement(element: HTMLElement, options: ScrollOptions = {}) {
  const { immediate = false, offset = 0 } = options;

  if (lenisInstance) {
    lenisInstance.scrollTo(element, { offset, immediate });
    return true;
  }

  element.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  return true;
}

export function smoothScrollToId(id: string, options: ScrollOptions = {}) {
  const element = document.getElementById(id);
  if (!element) return false;
  return smoothScrollToElement(element, options);
}

export function smoothScrollToTop(immediate = false) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { immediate });
    return;
  }

  window.scrollTo({ top: 0, left: 0, behavior: immediate ? "auto" : "smooth" });
}
