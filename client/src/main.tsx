import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import "lenis/dist/lenis.css";
import "./index.css";

function boot() {
  // Before render so the first page_viewed from RouteAnalytics is captured.
  initAnalytics();

  const container = document.getElementById("root")!;

  // Prerendered routes ship real markup inside #root, so they hydrate. Routes
  // served the bare shell (the funnel, unknown paths) still mount from scratch.
  if (container.firstElementChild) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(<App />);
  }
}

/**
 * ResizeObserver (Safari 13.1+) and IntersectionObserver (Safari 12.1+) are
 * constructed unguarded inside the dependencies — Radix, framer-motion and
 * Lenis among them — so on older WebKit the first one to run throws
 * "ResizeObserver is not a constructor" during render and the ErrorBoundary
 * replaces the whole site. Guarding this app's own call sites is not enough
 * when a library reaches for them first.
 *
 * The polyfills are dynamic imports, so they are separate chunks that a
 * browser which already has both APIs never requests. That path also stays
 * synchronous: `boot()` is called directly, exactly as before, and only a
 * browser actually missing something takes the async branch.
 */
const needsResizeObserver = typeof ResizeObserver === "undefined";
const needsIntersectionObserver = typeof IntersectionObserver === "undefined";

if (needsResizeObserver || needsIntersectionObserver) {
  const pending: Promise<unknown>[] = [];

  if (needsResizeObserver) {
    pending.push(
      import("@juggle/resize-observer").then(({ ResizeObserver: Polyfill }) => {
        (window as unknown as { ResizeObserver: unknown }).ResizeObserver = Polyfill;
      }),
    );
  }

  if (needsIntersectionObserver) {
    // Installs itself on window as a side effect.
    pending.push(import("intersection-observer"));
  }

  // A failed polyfill must not leave a blank page: boot either way and let the
  // ErrorBoundary handle whatever follows, which is the behaviour without this.
  Promise.all(pending).then(boot, boot);
} else {
  boot();
}
