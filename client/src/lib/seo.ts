/**
 * Per-route metadata for the marketing site: the single source of truth for
 * <title>, description, canonical, Open Graph / Twitter tags and Schema.org
 * structured data.
 *
 * scripts/prerender-seo.ts writes these values into each route's static HTML at
 * build time (what crawlers and link previews read); RouteSeo re-applies them
 * in the browser on client-side navigation.
 *
 * The canonical origin is a constant on purpose: VITE_SITE_URL is localhost in
 * development, and leaking that into canonical/og:url would deindex the site.
 */
// Same values as client/src/lib/urls.ts, which can't be imported here: it reads
// import.meta.env at load time, and scripts/prerender-seo.ts runs under plain Node.
const INSTAGRAM_URL = "https://www.instagram.com/epiminded.ai/";
const LINKEDIN_URL = "https://www.linkedin.com/company/epineonn";
const APP_STORE_URL = "https://apps.apple.com/ma/app/epiminded-boost-your-thinking/id6760017792";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=ai.epineon.new";

export const SITE_ORIGIN = "https://soulchain.net";
export const SITE_NAME = "SOULCHAIN";
/**
 * The sharing card, not the site logo.
 *
 * This pointed at /assets/logo.png until it was found to be the pre-rename
 * EpiMinded wordmark, grey on white: every crawler showed correct SOULCHAIN
 * copy beside the old brand's mark. og-share.png is built by
 * scripts/make-og-image.py from the same navbar logo the header uses, at the
 * 1200x630 WhatsApp, Slack, LinkedIn and X all render without re-cropping.
 *
 * The dimensions are published alongside it because WhatsApp decides whether
 * to draw a large card or a thumbnail before it has fetched the image.
 */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/og-share.png`;
export const DEFAULT_OG_IMAGE_ALT = "SOULCHAIN";
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;

/**
 * schema.org/Organization wants the organisation's own logo, square and on
 * its own, rather than the wide sharing card. favicon.png is the SOULCHAIN
 * mark at 512x512.
 */
export const ORGANIZATION_LOGO = `${SITE_ORIGIN}/favicon.png`;

export interface RouteSeo {
  title: string;
  description: string;
  /** Short page name, used as the page's breadcrumb label. */
  name?: string;
  /** Who the page is for, stated in its structured data. */
  audience?: string;
  /** Keep private/transactional funnel steps out of the index. */
  noindex?: boolean;
  /**
   * French overrides, applied in the browser when the visitor has chosen
   * French. The prerendered head stays English: French has no URL of its own.
   */
  fr?: { title?: string; description?: string };
}

/** Paths are normalised (no trailing slash, no query/hash) before lookup. */
export const SEO_BY_PATH: Record<string, RouteSeo> = {
  "/": {
    title: "Peer Learning Platform for Founders & Leaders | SOULCHAIN",
    description:
      "SOULCHAIN is a peer learning platform pairing a daily insight with a peer network matched on how you think. For founders, community builders and teams.",
    name: "Home",
    fr: {
      title: "Plateforme d'apprentissage entre pairs pour fondateurs et dirigeants | SOULCHAIN",
    },
  },
  "/founders": {
    title: "Founder Peer Group & Daily Insights | SOULCHAIN",
    description:
      "A peer group for founders: five-minute daily insights and conversations with operators at your level. Cognitive matching rebuilds the circle founders lose.",
    name: "For Founders",
    audience: "Founders",
  },
  "/community-builders": {
    title: "Community Retention Platform for Creators | SOULCHAIN",
    description:
      "A member retention platform for creators, founders and public figures whose audience pays to learn from them. You bring the audience; we bring the stack.",
    name: "For Community Builders",
    audience: "Community builders",
  },
  "/enterprise": {
    title: "Peer Learning for Teams & Organisations | SOULCHAIN",
    description:
      "Peer learning and cognitive infrastructure for organisations, from execs to operators. Daily insights teams actually use and a peer network they trust.",
    name: "For Organisations",
    audience: "Organisations",
  },
  "/legal/terms": {
    title: "Terms and Conditions | SOULCHAIN",
    description:
      "The terms and conditions governing use of the SOULCHAIN website and services.",
    name: "Terms and Conditions",
  },
  "/legal/privacy": {
    title: "Privacy Policy | SOULCHAIN",
    description:
      "How SOULCHAIN collects, uses, stores and protects your personal data, and the rights you have over it.",
    name: "Privacy Policy",
  },
  "/legal/cookies": {
    title: "Cookie Policy | SOULCHAIN",
    description:
      "Which cookies the SOULCHAIN website uses, what they are used for, and how to manage your preferences.",
    name: "Cookie Policy",
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

type JsonLd = Record<string, unknown>;

const ORG_ID = `${SITE_ORIGIN}/#organization`;
const EPINEON_ID = `${SITE_ORIGIN}/#epineon`;
const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
const APP_ID = `${SITE_ORIGIN}/#app`;

/**
 * Nodes describing SOULCHAIN itself, identical on every page. Only facts the
 * site or its app-store listings state: SOULCHAIN is developed by Epineon
 * (founded by Karim Amor), and its app is "SoulChain" on iOS and Android.
 */
function siteGraph(): JsonLd[] {
  const { description } = SEO_BY_PATH["/"];
  return [
    {
      "@type": "Organization",
      "@id": ORG_ID,
      name: SITE_NAME,
      alternateName: "SoulChain",
      url: `${SITE_ORIGIN}/`,
      logo: { "@type": "ImageObject", url: ORGANIZATION_LOGO, width: 512, height: 512 },
      description,
      sameAs: [INSTAGRAM_URL],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@epiminded.com",
      },
      parentOrganization: { "@id": EPINEON_ID },
    },
    {
      "@type": "Organization",
      "@id": EPINEON_ID,
      name: "Epineon",
      sameAs: [LINKEDIN_URL],
      founder: { "@type": "Person", name: "Karim Amor" },
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_ORIGIN}/`,
      name: SITE_NAME,
      alternateName: "SoulChain",
      description,
      inLanguage: ["en", "fr"],
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "MobileApplication",
      "@id": APP_ID,
      name: "SoulChain",
      operatingSystem: "iOS, Android",
      applicationCategory: "SocialNetworkingApplication",
      description,
      sameAs: [APP_STORE_URL, PLAY_STORE_URL],
      author: { "@id": EPINEON_ID },
      publisher: { "@id": EPINEON_ID },
      provider: { "@id": ORG_ID },
    },
  ];
}

/**
 * Schema.org graph for a route: the site nodes, plus a WebPage (and a
 * breadcrumb below the home page) for each public page. Other paths get the
 * site nodes only.
 */
export function structuredDataForPath(rawPath: string): JsonLd {
  const path = normalizePath(rawPath);
  const page = SEO_BY_PATH[path];
  const graph = siteGraph();

  if (page) {
    const url = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
    const breadcrumbId = `${url}#breadcrumb`;
    graph.push({
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      ...(page.audience ? { audience: { "@type": "Audience", audienceType: page.audience } } : {}),
      ...(path === "/" ? {} : { breadcrumb: { "@id": breadcrumbId } }),
    });
    if (path !== "/") {
      graph.push({
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SEO_BY_PATH["/"].name, item: `${SITE_ORIGIN}/` },
          { "@type": "ListItem", position: 2, name: page.name ?? page.title, item: url },
        ],
      });
    }
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

/** JSON for a <script type="application/ld+json"> body; "<" is escaped so the text can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
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

function upsertStructuredData(data: JsonLd) {
  let el = document.head.querySelector<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  );
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = "structured-data";
    document.head.appendChild(el);
  }
  el.textContent = serializeJsonLd(data);
}

/** Patches the document head for the given path and language. Renders nothing. */
export function applySeo(rawPath: string, language: "en" | "fr" = "en") {
  if (typeof document === "undefined") return;

  const seo = seoForPath(rawPath);
  const { canonical, noindex } = seo;
  const fr = language === "fr" ? seo.fr : undefined;
  const title = fr?.title ?? seo.title;
  const description = fr?.description ?? seo.description;

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
  upsertMeta({ property: "og:image:width" }, String(DEFAULT_OG_IMAGE_WIDTH));
  upsertMeta({ property: "og:image:height" }, String(DEFAULT_OG_IMAGE_HEIGHT));
  upsertMeta({ property: "og:image:alt" }, DEFAULT_OG_IMAGE_ALT);

  // The card is 1200x630, so X should draw it full width rather than as the
  // square thumbnail "summary" asks for.
  upsertMeta({ name: "twitter:card" }, "summary_large_image");
  upsertMeta({ name: "twitter:title" }, title);
  upsertMeta({ name: "twitter:description" }, description);
  upsertMeta({ name: "twitter:image" }, DEFAULT_OG_IMAGE);
  upsertMeta({ name: "twitter:image:alt" }, DEFAULT_OG_IMAGE_ALT);

  upsertStructuredData(structuredDataForPath(rawPath));
}
