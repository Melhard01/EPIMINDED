/**
 * Cloudflare entry point: PostHog ingest proxy, same-origin API proxies to the
 * Soulchain gateway / Polar, and static assets for everything else.
 *
 * Browser → Worker → backend.soulchain.net (JSON)
 * not Browser → Worker → SPA HTML for /api/* and /checkout.
 */

import { handleApiRoute, matchApiRoute } from "./api-proxy";
import type { WorkerEnv } from "./upstream";

const INGEST_PREFIX = "/ingest";
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

export type Env = WorkerEnv;

async function proxyToPostHog(request: Request, url: URL): Promise<Response> {
  const path = url.pathname.slice(INGEST_PREFIX.length) || "/";
  const isStatic = path.startsWith("/static/");
  const upstreamHost = isStatic ? ASSET_HOST : API_HOST;

  const upstream = new URL(request.url);
  upstream.protocol = "https:";
  upstream.hostname = upstreamHost;
  upstream.port = "";
  upstream.pathname = path;

  const headers = new Headers(request.headers);
  headers.set("Host", upstreamHost);
  headers.delete("cookie");

  const response = await fetch(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

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

    const apiRoute = matchApiRoute(url.pathname);
    if (apiRoute) {
      return handleApiRoute(apiRoute, request, env);
    }

    // Prerendered marketing site + SPA fallback (wrangler.jsonc assets).
    return env.ASSETS.fetch(request);
  },
};
