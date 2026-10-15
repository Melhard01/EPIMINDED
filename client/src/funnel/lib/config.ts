/**
 * Central funnel configuration: brand + the web-facing pricing.
 *
 * Pricing = Track B (end-user retail) from the SOULCHAIN pricing deck. Track A
 * (enterprise / per-seat) is a sales-led motion and intentionally not exposed in
 * this self-serve web funnel. Prices are taken from the deck as-is (they include
 * the store-fee buffer); the web simply collects payment fee-free and the
 * entitlement carries into the app.
 *
 * PlanOffer cents are the prices shown and charged, on the web as in the stores.
 */

import { formatUsd } from "@/funnel/lib/pricing";

export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_URL) ||
  "http://localhost:3000";

export const APP = {
  name: "SOULCHAIN",
  tagline: "Stay ahead of what is coming.",
} as const;

export type BillingInterval = "month" | "year";

export type OfferId = "lite" | "standard" | "pro";

export type WebPlanPricing = {
  currency?: string;
  amount?: number;
  billing_cycle?: string;
};

export type WebPlanSubplan = {
  name?: string;
  description?: string;
  pricing?: readonly WebPlanPricing[];
  popular?: boolean;
};

export type WebPlansApiResponse = {
  plan?: {
    name?: string;
    description?: string;
    features?: readonly string[];
    subplan?: readonly WebPlanSubplan[];
  };
};

/** Single membership, one of three frequency tiers — static fallback. */
const SUBSCRIPTION_PLANS_PAYLOAD = {
  name: "SOULCHAIN Subscription Plans",
  description: "Pricing tiers for the SOULCHAIN cohort platform",
  features: [
    "Community access",
    "Community Brain Boosters",
    "Personalized Upskilling Brain Boosters (Text · Audio · Podcast)",
    "360 thinking",
    "Nearby Peers Recommendation",
    "Daily Groups",
    "1-1 Peer discussions (Chat · Video calls)",
    "Quiz tests",
    "Weekly progress",
  ],
  discount: 0,
  is_active: true,
  project: "SOULCHAIN",
  subplan: [
    {
      name: "LITE",
      description: "Essential features for getting started",
      pricing: [
        {
          currency: "USD",
          amount: 19.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 199.0,
          billing_cycle: "year",
        },
      ],
      popular: false,
    },
    {
      name: "Standard",
      description: "Perfect balance for full cohort participation",
      pricing: [
        {
          currency: "USD",
          amount: 29.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 299.0,
          billing_cycle: "year",
        },
      ],
      popular: true,
    },
    {
      name: "PRO",
      description: "Advanced tools, networking, and priority access",
      pricing: [
        {
          currency: "USD",
          amount: 39.99,
          billing_cycle: "month",
        },
        {
          currency: "USD",
          amount: 399.0,
          billing_cycle: "year",
        },
      ],
      popular: false,
    },
  ],
  index: 0,
} as const;

export const PLAN_NAME = SUBSCRIPTION_PLANS_PAYLOAD.name;

export interface PlanOffer {
  /** Stable id used across funnel state + entitlement token. */
  id: OfferId;
  /** Tier display name. */
  name: string;
  /** Booster cadence. */
  frequency: string;
  monthlyCents: number;
  annualCents: number;
  monthlyLabel: string;
  annualLabel: string;
  recommended?: boolean;
  blurb: string;
}

const FREQUENCY_BY_ID: Record<OfferId, string> = {
  lite: "3 boosters / week",
  standard: "5 boosters / week",
  pro: "7 boosters / week",
};

function offerIdFromName(name: string | undefined): OfferId | null {
  const normalized = (name || "").trim().toLowerCase();
  if (normalized === "lite") return "lite";
  if (normalized === "standard") return "standard";
  if (normalized === "pro") return "pro";
  return null;
}

function mapSubplanToOffer(subplan: WebPlanSubplan): PlanOffer | null {
  const id = offerIdFromName(subplan.name);
  if (!id) return null;

  const pricing = Array.isArray(subplan.pricing) ? subplan.pricing : [];
  const monthly = pricing.find((p) => p.billing_cycle === "month");
  const annual = pricing.find((p) => p.billing_cycle === "year");
  if (typeof monthly?.amount !== "number" || typeof annual?.amount !== "number") {
    return null;
  }

  return {
    id,
    name: typeof subplan.name === "string" && subplan.name.trim() ? subplan.name.trim() : id,
    frequency: FREQUENCY_BY_ID[id],
    monthlyCents: Math.round(monthly.amount * 100),
    annualCents: Math.round(annual.amount * 100),
    monthlyLabel: formatUsd(monthly.amount),
    annualLabel: formatUsd(annual.amount),
    recommended: Boolean(subplan.popular),
    blurb:
      typeof subplan.description === "string" && subplan.description.trim()
        ? subplan.description.trim()
        : "",
  };
}

/**
 * Map GET /plans/web payload into paywall tiers + features.
 * Returns null when the payload cannot produce a usable tier list.
 */
export function mapWebPlansPayload(
  payload: WebPlansApiResponse,
): { tiers: PlanOffer[]; features: string[] } | null {
  const subplans = payload.plan?.subplan;
  if (!Array.isArray(subplans) || subplans.length === 0) return null;

  const tiers = subplans
    .map(mapSubplanToOffer)
    .filter((tier): tier is PlanOffer => tier !== null);

  if (tiers.length === 0) return null;

  const order: OfferId[] = ["lite", "standard", "pro"];
  tiers.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return {
    tiers,
    // Feature list is owned by the web UI (SHARED_FEATURES), not the plans API.
    features: [...SUBSCRIPTION_PLANS_PAYLOAD.features],
  };
}

/**
 * Three tiers — static fallback from SUBSCRIPTION_PLANS_PAYLOAD.
 * Frequency copy remains UI-specific and maps by tier id.
 */
export const TIERS: PlanOffer[] =
  mapWebPlansPayload({ plan: SUBSCRIPTION_PLANS_PAYLOAD })?.tiers ?? [];

export const ALL_OFFERS: PlanOffer[] = TIERS;

export function findOffer(id: string): PlanOffer | undefined {
  return ALL_OFFERS.find((o) => o.id === id);
}

/** Every tier includes the full feature set (static fallback). */
export const SHARED_FEATURES = [...SUBSCRIPTION_PLANS_PAYLOAD.features];

/**
 * Optional paid add-on. NOTE: price below is a PLACEHOLDER — set the real
 * dedicated pricing here.
 */
export const ADDON = {
  id: "voiceprint",
  name: "Custom Brain Booster",
  desc: "Your voice print, plus one-tap sharing to Instagram, LinkedIn & Spotify.",
  monthlyCents: 799,
  annualCents: 7900,
  monthlyLabel: "$7.99",
  annualLabel: "$79",
} as const;

/** Is Polar checkout configured? (server sets VITE_POLAR_CONFIGURED or product ids present) */
export const POLAR_ENABLED = true;

const POLAR_PRODUCT_FALLBACKS: Record<string, string> = {
  POLAR_PRODUCT_LITE_MONTH: "ed645dbc-b203-4918-a8d1-9ae31dc068df",
  POLAR_PRODUCT_LITE_YEAR: "e533fd93-72a2-41ec-9a8e-420ef2454481",
  POLAR_PRODUCT_STANDARD_MONTH: "4aa020b5-a785-43ec-b864-a87c92c2933c",
  POLAR_PRODUCT_STANDARD_YEAR: "144a19c9-17d4-40c4-96bd-3f3aa0efaea4",
  POLAR_PRODUCT_PRO_MONTH: "7f3523f0-19ec-4ffe-b60c-0250b73058d0",
  POLAR_PRODUCT_PRO_YEAR: "00d7d1fa-fc55-4731-91bb-db3bafdd05c8",
};

export type PolarServer = "sandbox" | "production";

/**
 * The Polar environment as the browser bundle sees it.
 *
 * Only VITE_* variables are inlined at build time, so VITE_POLAR_SERVER is the
 * one signal the client has — wrangler.jsonc `vars` are Worker *runtime*
 * bindings and never reach the Vite build. Unset is treated as production,
 * which is the cautious direction: it withholds the sandbox fallbacks rather
 * than shipping them to a live paywall.
 */
export function clientPolarServer(): PolarServer {
  const raw =
    typeof import.meta !== "undefined"
      ? ((import.meta.env?.VITE_POLAR_SERVER as string | undefined) ?? "").trim()
      : "";
  return raw === "sandbox" ? "sandbox" : "production";
}

/**
 * Per-offer Polar product id lookup. Prefers VITE_POLAR_PRODUCT_* then
 * POLAR_PRODUCT_*.
 *
 * Mirrors server/funnel/lib/config.ts — see that copy for why the sandbox
 * fallbacks are withheld in production. It matters more here: this module is
 * bundled into the browser, so before this guard a build without
 * VITE_POLAR_PRODUCT_* shipped the sandbox ids to every visitor and put them
 * in the checkout link. The Worker now rejects an unrecognised product, so
 * the failure is a clear error rather than a live checkout for a product that
 * does not exist in the production organisation.
 */
export function polarProductIdFor(
  offerId: string,
  interval: BillingInterval,
  server: PolarServer = clientPolarServer(),
): string | undefined {
  const key = `POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}`;
  const viteKey = `VITE_${key}`;
  const fromVite =
    typeof import.meta !== "undefined"
      ? (import.meta.env?.[viteKey] as string | undefined)
      : undefined;
  if (fromVite?.trim()) return fromVite.trim();
  if (typeof process !== "undefined" && process.env?.[key]?.trim()) {
    return process.env[key]!.trim();
  }
  if (server === "production") return undefined;
  return POLAR_PRODUCT_FALLBACKS[key];
}

export const DEEPLINK = {
  scheme: (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_DEEPLINK_SCHEME) || "epiminded",
  universalLink:
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_UNIVERSAL_LINK) || "https://open.epiminded.app",
} as const;

/** Store listings for the per-platform handoff sections. */
export const STORES = {
  android: {
    platform: "Android",
    subtitle: "Get it on Google Play",
    url: "https://play.google.com/store/apps/details?id=ai.epineon.new",
  },
  ios: {
    platform: "iOS",
    subtitle: "Download on the App Store",
    url: "https://apps.apple.com/us/app/epiminded-upskill-network/id6760017792",
  },
} as const;
