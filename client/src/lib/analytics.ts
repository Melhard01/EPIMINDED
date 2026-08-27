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
/**
 * Telemetry goes through a first-party reverse proxy on this origin, so the
 * requests are same-origin and the common blocklists (which match
 * *.posthog.com) do not drop them. The rewrites that back this path live in
 * vercel.json, worker/index.ts and server/index.ts; the Vite dev server
 * proxies it too. Keep all four in step with this value.
 *
 * Set VITE_POSTHOG_HOST=https://us.i.posthog.com to bypass the proxy — useful
 * to confirm whether a delivery problem is the proxy or PostHog itself.
 */
const HOST = import.meta.env.VITE_POSTHOG_HOST?.trim() || "/ingest";

/**
 * Where the PostHog app itself lives. api_host no longer points at PostHog, so
 * without this the toolbar and the "view recording" links built by
 * get_session_replay_url() would be generated against our own domain.
 */
const UI_HOST =
  import.meta.env.VITE_POSTHOG_UI_HOST?.trim() || "https://us.posthog.com";

let ready = false;

export function initAnalytics() {
  // Guarded so React StrictMode's double-invoked effects, or any accidental
  // second call, cannot produce two PostHog instances.
  if (ready || typeof window === "undefined" || !KEY) return;

  try {
    posthog.init(KEY, {
      api_host: HOST,
      ui_host: UI_HOST,
      /**
       * "history_change" captures $pageview on first load *and* on every
       * History API change, which is exactly how wouter navigates — so SPA
       * route changes are covered without double-counting the initial load.
       *
       * This has to be $pageview specifically. PostHog's Web Analytics
       * dashboard and its Installation Health checks look for that event by
       * name; the semantic `page_viewed` event emitted in RouteAnalytics is
       * for our own funnels and does not satisfy them.
       *
       * It also restores scroll depth. PostHog measures scroll internally and
       * reports it as $prev_pageview_max_scroll / _percentage attached to the
       * following $pageview and to $pageleave. With pageview capture off,
       * those properties were never emitted, which is why the dashboard
       * reported scroll depth as missing. capture_pageleave must stay on for
       * the same reason — it carries the final scroll figure for a page.
       */
      capture_pageview: "history_change",
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      autocapture: false,

      /**
       * Session replay stays on for the whole site — clicks, scrolls,
       * navigation and form interaction are all recorded. What is suppressed
       * is the *content* of anything sensitive:
       *
       * - maskAllInputs masks the value of every <input>/<textarea>. Masking
       *   by input type would not be enough here: the signup form renders its
       *   password fields as `type={showPassword ? "text" : "password"}`, so
       *   the moment a visitor clicks the reveal toggle a type-based rule
       *   would start recording the password in clear.
       * - maskTextSelector covers sensitive values rendered as *text* rather
       *   than typed into a field, which input masking never sees — the email
       *   echoed back on the success screen, for instance.
       *
       * Elements carrying `ph-no-capture` are blanked entirely. That is used
       * for the entitlement-token links and their QR code, which cannot be
       * text-masked because a QR image is machine-readable.
       */
      // Stated explicitly rather than left to the default, so replay cannot be
      // switched off by a change of defaults in a future posthog-js release.
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
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
