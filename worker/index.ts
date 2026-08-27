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

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
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

    // Everything else is the prerendered site. not_found_handling in
    // wrangler.toml keeps the SPA fallback behaviour for unknown routes.
    return env.ASSETS.fetch(request);
  },
};
