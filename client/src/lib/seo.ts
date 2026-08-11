/**
 * Per-route metadata for the marketing site.
 *
 * This is a client-rendered SPA, so the document head is patched at runtime.
 * index.html carries the home-page defaults, which means crawlers that do not
 * execute JS still get valid (if generic) metadata, and Googlebot — which does
 * render — sees the per-route values below.
 *
 * The canonical origin is a constant on purpose: VITE_SITE_URL is localhost in
 * development, and leaking that into canonical/og:url would deindex the site.
 */
export const SITE_ORIGIN = "https://soulchain.net";
export const SITE_NAME = "SOULCHAIN";
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/logo.png`;

export interface RouteSeo {
  title: string;
  description: string;
  /** Keep private/transactional funnel steps out of the index. */
  noindex?: boolean;
}

/** Paths are normalised (no trailing slash, no query/hash) before lookup. */
export const SEO_BY_PATH: Record<string, RouteSeo> = {
  "/": {
    title: "Peer Learning Platform for Founders & Leaders | SOULCHAIN",
    description:
      "SOULCHAIN is a peer learning platform pairing a daily insight with a peer network matched on how you think. For founders, community builders and teams.",
  },
  "/founders": {
    title: "Founder Peer Group & Daily Insights | SOULCHAIN",
    description:
      "A peer group for founders: five-minute daily insights and conversations with operators at your level. Cognitive matching rebuilds the circle founders lose.",
  },
  "/community-builders": {
    title: "Community Retention Platform for Creators | SOULCHAIN",
    description:
      "A member retention platform for creators, founders and public figures whose audience pays to learn from them. You bring the audience; we bring the stack.",
  },
  "/enterprise": {
    title: "Peer Learning for Teams & Organisations | SOULCHAIN",
    description:
      "Peer learning and cognitive infrastructure for organisations, from execs to operators. Daily insights teams actually use and a peer network they trust.",
  },
  "/legal/terms": {
    title: "Terms and Conditions | SOULCHAIN",
    description:
      "The terms and conditions governing use of the SOULCHAIN website and services.",
  },
  "/legal/privacy": {
    title: "Privacy Policy | SOULCHAIN",
    description:
      "How SOULCHAIN collects, uses, stores and protects your personal data, and the rights you have over it.",
  },
  "/legal/cookies": {
    title: "Cookie Policy | SOULCHAIN",
    description:
      "Which cookies the SOULCHAIN website uses, what they are used for, and how to manage your preferences.",
  },
};

/**
 * Funnel and error routes. These are transactional or user-specific steps with
 * no standalone search value, so they are excluded from the index and sitemap.
 */
const NOINDEX_PREFIXES = [
  "/quiz",
  "/report",
  "/paywall",
  "/pre-checkout",
  "/success",
  "/404",
];

export function normalizePath(rawPath: string): string {
  const path = (rawPath.split("?")[0] || "").split("#")[0] || "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function seoForPath(rawPath: string): RouteSeo & { canonical: string } {
  const path = normalizePath(rawPath);
  const known = SEO_BY_PATH[path];

  if (known) {
    return { ...known, canonical: `${SITE_ORIGIN}${path === "/" ? "/" : path}` };
  }

  const isFunnel = NOINDEX_PREFIXES.some(
    prefix => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (isFunnel) {
    return {
      title: `${SITE_NAME}`,
      description: SEO_BY_PATH["/"].description,
      noindex: true,
      canonical: `${SITE_ORIGIN}${path}`,
    };
  }

  // Unknown path -> 404 view. Never index, and never claim a canonical that
  // would compete with a real page.
  return {
    title: `Page not found | ${SITE_NAME}`,
    description: SEO_BY_PATH["/"].description,
    noindex: true,
    canonical: `${SITE_ORIGIN}${path}`,
  };
}

type MetaSelector =
  | { name: string; property?: never }
  | { property: string; name?: never };

function upsertMeta(selector: MetaSelector, content: string) {
  const key = selector.name ? "name" : "property";
  const value = selector.name ?? selector.property!;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${key}="${value}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Patches the document head for the given path. Renders nothing. */
export function applySeo(rawPath: string) {
  if (typeof document === "undefined") return;

  const { title, description, canonical, noindex } = seoForPath(rawPath);

  document.title = title;
  upsertMeta({ name: "description" }, description);
  upsertLink("canonical", canonical);
  upsertMeta(
    { name: "robots" },
    noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"
  );

  upsertMeta({ property: "og:title" }, title);
  upsertMeta({ property: "og:description" }, description);
  upsertMeta({ property: "og:url" }, canonical);
  upsertMeta({ property: "og:type" }, "website");
  upsertMeta({ property: "og:site_name" }, SITE_NAME);
  upsertMeta({ property: "og:image" }, DEFAULT_OG_IMAGE);

  upsertMeta({ name: "twitter:card" }, "summary");
  upsertMeta({ name: "twitter:title" }, title);
  upsertMeta({ name: "twitter:description" }, description);
  upsertMeta({ name: "twitter:image" }, DEFAULT_OG_IMAGE);
}
