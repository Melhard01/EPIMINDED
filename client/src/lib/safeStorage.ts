/**
 * localStorage / sessionStorage access that cannot throw.
 *
 * Safari throws on *any* storage access — read included — when "Block All
 * Cookies" is enabled (Settings → Safari → Advanced) and in some Private
 * Browsing configurations. It is a `SecurityError`, not a quota error, and
 * even reading `window.localStorage` can throw before a method is called.
 *
 * Chrome effectively never does this, which is what makes it dangerous: an
 * unguarded `localStorage.getItem` looks fine in development and takes the
 * whole site down on an iPhone. The read in LanguageProvider runs inside a
 * layout effect, so the throw propagated out of the commit phase to the
 * app-level ErrorBoundary and replaced the page with the error screen —
 * reproduced in Chrome with storage stubbed to throw: 322 rendered elements
 * dropped to 21 and the `<h1>` disappeared.
 *
 * Everything here degrades to "no stored value", which every caller already
 * handles: the site simply falls back to its defaults.
 */

type Area = "local" | "session";

function storage(area: Area): Storage | null {
  try {
    // The property access itself is what throws in a blocked Safari.
    const value = area === "local" ? window.localStorage : window.sessionStorage;
    return value ?? null;
  } catch {
    return null;
  }
}

export function readStored(area: Area, key: string): string | null {
  try {
    return storage(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStored(area: Area, key: string, value: string): void {
  try {
    storage(area)?.setItem(key, value);
  } catch {
    /* blocked or full: the value is simply not remembered */
  }
}

export function removeStored(area: Area, key: string): void {
  try {
    storage(area)?.removeItem(key);
  } catch {
    /* nothing to do */
  }
}
