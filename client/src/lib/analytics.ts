import posthog from "posthog-js";

/**
 * PostHog wrapper.
 *
 * Every export is a no-op when analytics are unavailable — during the
 * build-time render (no window), when VITE_POSTHOG_KEY is unset, or if init
 * threw. Call sites therefore never need to guard, and a missing key can never
 * break a page.
 *
 * The project token is a *publishable* credential: posthog-js ships it to the
 * browser by definition, so it is not a secret. It still comes from the
 * environment so it is not hardcoded and can differ per deployment.
 */

/**
 * PostHog calls this the *project token* (also shown as "Project API Key" in
 * the UI). It is the `phc_...` value posthog.init() takes as its first
 * argument. Either variable name works.
 */
const KEY =
  import.meta.env.VITE_POSTHOG_TOKEN?.trim() ||
  import.meta.env.VITE_POSTHOG_KEY?.trim();
const HOST =
  import.meta.env.VITE_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

let ready = false;

export function initAnalytics() {
  // Guarded so React StrictMode's double-invoked effects, or any accidental
  // second call, cannot produce two PostHog instances.
  if (ready || typeof window === "undefined" || !KEY) return;

  try {
    posthog.init(KEY, {
      api_host: HOST,
      // Route changes are captured explicitly in RouteAnalytics: this is a SPA,
      // so PostHog's own pageview detection would miss client-side navigation
      // and double-count the first load.
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: false,
      // Never let a blocked or slow analytics host affect the page.
      request_batching: true,
    });
    ready = true;
    // The npm module does not self-register the way the snippet does, and the
    // PostHog toolbar and debugging both look for window.posthog.
    (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
  } catch {
    ready = false;
  }
}

type Props = Record<string, unknown>;

/** Drops null/undefined so events do not carry empty keys. */
function clean(props?: Props): Props {
  if (!props) return {};
  const out: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (v !== null && v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

export function track(event: string, props?: Props) {
  if (!ready) return;
  try {
    posthog.capture(event, clean(props));
  } catch {
    /* analytics must never break a user flow */
  }
}

/**
 * Associates the anonymous visitor with the application's user id after
 * registration. Only the id and non-sensitive traits are sent — never
 * passwords, OTP codes, tokens or payment details.
 */
export function identifyUser(userId: string, traits?: Props) {
  if (!ready || !userId) return;
  try {
    posthog.identify(userId, clean(traits));
  } catch {
    /* ignore */
  }
}

export function resetAnalytics() {
  if (!ready) return;
  try {
    posthog.reset();
  } catch {
    /* ignore */
  }
}

export const analyticsEnabled = () => ready;
