/**
 * Cloudflare entry point: a first-party reverse proxy for PostHog telemetry,
 * with everything else served from the static assets in dist/public.
 *
 * Requests to /ingest/* are forwarded to PostHog from the edge, so the browser
 * only ever talks to soulchain.net. Blocklists match *.posthog.com, so routing
 * through our own origin is what stops ad blockers dropping the requests.
 *
 * Two upstreams, because PostHog splits them:
 *   /ingest/static/*  -> us-assets.i.posthog.com  (recorder, surveys, config)
 *   /ingest/*         -> us.i.posthog.com         (events /e/, replay /s/)
 *
 * Keep the path in step with api_host in client/src/lib/analytics.ts.
 */

const INGEST_PREFIX = "/ingest";
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

/**
 * Lead capture for the "Request a Community" form.
 *
 * The community service is HTTP-only, and a browser refuses a plain-HTTP
 * request made from an https:// page, so the form cannot call it directly on
 * soulchain.net. The call is made from the edge instead: the browser talks to
 * our own origin over HTTPS, and the worker talks to the upstream. Mixed
 * content does not apply server-side.
 *
 * Mirrors the validation in server/funnel/routes.ts so both paths behave the
 * same — notably the community_type allowlist, which the upstream does not
 * enforce.
 */
const COMMUNITY_REQUEST_PATH = "/api/communities/request";

/**
 * Cloudflare refuses a Worker subrequest addressed to a bare IP and answers
 * "error code: 1003" (Direct IP Access Not Allowed), so the default below
 * cannot work from the edge — the same request succeeds from any ordinary
 * host. Point COMMUNITY_UPSTREAM_URL at a hostname that resolves to the
 * service (a DNS-only record, since 5044 is not a Cloudflare-proxied port)
 * and lead capture starts working with no code change.
 */
const DEFAULT_COMMUNITY_UPSTREAM =
  "http://40.89.185.79:5044/communities/request/lead";
const ALLOWED_COMMUNITY_TYPES = new Set([
  "founders",
  "community_builders",
  "organisations",
]);

async function handleCommunityRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(payload.name);
  const communityType = str(payload.community_type);
  const phone = str(payload.phone);
  const email = str(payload.email).toLowerCase();

  if (
    !name || name.length > 200 ||
    !ALLOWED_COMMUNITY_TYPES.has(communityType) ||
    !phone || !email
  ) {
    return Response.json(
      { message: "name, community_type, phone and email are required." },
      { status: 400 },
    );
  }

  const upstreamUrl = env.COMMUNITY_UPSTREAM_URL?.trim() || DEFAULT_COMMUNITY_UPSTREAM;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, community_type: communityType, phone, email }),
    });
    const text = await upstream.text();

    // A Cloudflare edge error is not an answer from the community service, and
    // forwarding it verbatim surfaces a raw "error code: 1003" in the form.
    // Report it as a gateway failure instead, so the cause is legible.
    if (!text.trim().startsWith("{")) {
      return Response.json(
        { message: "Community service is temporarily unavailable." },
        { status: 502 },
      );
    }

    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { message: "Community service is temporarily unavailable." },
      { status: 502 },
    );
  }
}

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  /** Set as a wrangler var; see DEFAULT_COMMUNITY_UPSTREAM. */
  COMMUNITY_UPSTREAM_URL?: string;
}

async function proxyToPostHog(request: Request, url: URL): Promise<Response> {
  const path = url.pathname.slice(INGEST_PREFIX.length) || "/";
  const isStatic = path.startsWith("/static/");
  const upstreamHost = isStatic ? ASSET_HOST : API_HOST;

  const upstream = new URL(request.url);
  upstream.protocol = "https:";
  upstream.hostname = upstreamHost;
  upstream.port = "";
  upstream.pathname = path;

  // Host must be rewritten or PostHog rejects the request; the original client
  // headers (content-type, encoding) are otherwise passed through untouched so
  // gzipped batches and beacons arrive intact.
  const headers = new Headers(request.headers);
  headers.set("Host", upstreamHost);
  headers.delete("cookie");

  const response = await fetch(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  // Same-origin from the browser's point of view, so no CORS headers needed —
  // but the response is cloned to drop upstream cookies we do not want set on
  // our own domain.
  const out = new Headers(response.headers);
  out.delete("set-cookie");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: out,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === INGEST_PREFIX || url.pathname.startsWith(`${INGEST_PREFIX}/`)) {
      return proxyToPostHog(request, url);
    }

    if (url.pathname === COMMUNITY_REQUEST_PATH) {
      return handleCommunityRequest(request, env);
    }

    // Everything else is the prerendered site. not_found_handling in
    // wrangler.toml keeps the SPA fallback behaviour for unknown routes.
    return env.ASSETS.fetch(request);
  },
};
