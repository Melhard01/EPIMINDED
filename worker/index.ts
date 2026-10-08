/**
 * Cloudflare entry point: PostHog ingest proxy, same-origin API proxies to the
 * Soulchain gateway / Polar, and static assets for everything else.
 *
 * Browser → Worker → backend.soulchain.net (JSON)
 * not Browser → Worker → SPA HTML for /api/* and /checkout.
 */

import { handleApiRoute, matchApiRoute } from "./api-proxy";
import type { WorkerEnv } from "./upstream";

/**
 * WebP has a PNG/JPEG twin beside it (scripts/make-image-fallbacks.py), for
 * clients that cannot decode WebP — Safari below 14, so every iOS below 14.
 * Those clients ask for the .webp URL written in the markup and the CSS, and
 * get the twin back; nothing in the application changes.
 *
 * Only `/assets/*.webp` is routed through the Worker (run_worker_first in
 * wrangler.jsonc). Every other asset is still served by the asset layer
 * without the Worker running at all.
 */
const WEBP = /\.webp$/i;
const FALLBACK_EXTENSIONS = [".png", ".jpg"];

/**
 * A browser that supports WebP advertises `image/webp`; Safari below 14 sends
 * an image Accept list without it.
 *
 * A request with no Accept header, or one that never mentions images (curl,
 * some crawlers), keeps the modern path — that is what they receive today, and
 * guessing otherwise would downgrade them for no reason.
 */
function acceptsWebp(request: Request): boolean {
  const accept = request.headers.get("Accept");
  if (!accept || !accept.includes("image/")) return true;
  return accept.includes("image/webp");
}

/**
 * Caches must not hand a WebP to a client that asked without it.
 *
 * Also carries the asset CORS header, so a response that came through the
 * Worker matches what client/public/_headers declares for the assets the
 * static layer serves directly. See that file for why it is needed.
 */
function varyOnAccept(response: Response): Response {
  const out = new Response(response.body, response);
  const existing = out.headers.get("Vary");
  out.headers.set("Vary", existing ? `${existing}, Accept` : "Accept");
  out.headers.set("Access-Control-Allow-Origin", "*");
  return out;
}

async function serveImage(request: Request, url: URL, env: Env): Promise<Response> {
  if (acceptsWebp(request)) {
    return varyOnAccept(await env.ASSETS.fetch(request));
  }

  for (const extension of FALLBACK_EXTENSIONS) {
    const alternate = new URL(url.toString());
    alternate.pathname = url.pathname.replace(WEBP, extension);
    const response = await env.ASSETS.fetch(new Request(alternate.toString(), request));
    if (response.ok) return varyOnAccept(response);
  }

  // No twin on disk: the WebP is still better than a broken image.
  return varyOnAccept(await env.ASSETS.fetch(request));
}

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

    // Routed here by run_worker_first; everything else static never reaches
    // the Worker. Must come before the app-shell fallback below, which would
    // otherwise answer an image request with HTML.
    if (WEBP.test(url.pathname)) {
      return serveImage(request, url, env);
    }

    /**
     * A file request that matched no asset must 404, not fall through to the
     * SPA shell below.
     *
     * Hashed bundles are replaced on every deploy, and a browser holding
     * markup from an earlier build still asks for its old one. Answering that
     * with the shell hands back an HTML document under a 200: the module
     * parser then fails on `<!doctype html>` and the app never boots, which
     * leaves a correctly styled page whose every section is still at
     * `opacity: 0` because only hydration clears it. The same miss on a
     * stylesheet is rejected for its MIME type and renders the page unstyled.
     * Both read as "the site is broken" with nothing in the console that
     * points at a missing file.
     *
     * Existing assets never reach this line — the static layer serves them
     * before the Worker runs — so this only ever answers a genuine miss.
     * `.html` is left out: a missing page should still get the SPA shell.
     */
    if (/\/[^/]+\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith(".html")) {
      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    // Static files, including the prerendered marketing pages, are served
    // before the Worker runs, so whatever reaches this line matched none:
    // funnel steps, the /terms-style client redirects and unknown paths. They
    // get the empty SPA shell (noindex, no canonical). The assets' own SPA
    // fallback would serve index.html, which is the prerendered home page.
    return env.ASSETS.fetch(new Request(new URL("/app-shell", url), request));
  },
};
