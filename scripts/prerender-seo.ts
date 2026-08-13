/**
 * Emits a per-route index.html so each public page serves its own canonical,
 * title, description and Open Graph tags — and its real rendered markup — in
 * the initial HTML.
 *
 * Two problems this solves:
 *
 * 1. An SPA serves one index.html for every route, so /founders was served with
 *    `canonical -> https://soulchain.net/`. That tells Google the page is a
 *    duplicate of the home page. RouteSeo corrects it after hydration, but only
 *    for crawlers that execute JS — and it cannot help social scrapers, which
 *    never run any.
 *
 * 2. The shipped body was `<div id="root"></div>`, so a crawler that does not
 *    execute JS saw no content at all. Retrieval-oriented crawlers (OAI-SearchBot,
 *    PerplexityBot and friends) largely do not render, so the pages were
 *    effectively empty to them.
 *
 * Each generated file is the built app shell with <head> values swapped and the
 * route's markup rendered into #root by client/src/entry-server.tsx. The same
 * bundle boots on top of it and hydrates, so behaviour is unchanged.
 *
 * Metadata comes from client/src/lib/seo.ts, which stays the single source of
 * truth shared with the runtime.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_BY_PATH,
  SITE_ORIGIN,
  DEFAULT_OG_IMAGE,
} from "../client/src/lib/seo";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist", "public");
const shellPath = join(outDir, "index.html");

/** Escape for use inside an HTML attribute or text node. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace a tag's content, failing loudly if the shell no longer matches. */
function replaceOne(html: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(html)) {
    throw new Error(`prerender-seo: no match for ${pattern} in index.html`);
  }
  return html.replace(pattern, replacement);
}

function buildPage(shell: string, path: string, body: string): string {
  const { title, description } = SEO_BY_PATH[path];
  const canonical = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
  const t = esc(title);
  const d = esc(description);

  let html = shell;
  html = replaceOne(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${body}</div>`
  );
  html = replaceOne(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = replaceOne(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = replaceOne(
    html,
    /<meta name="description" content="[^"]*">/,
    `<meta name="description" content="${d}">`
  );
  html = replaceOne(
    html,
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonical}">`
  );
  html = replaceOne(
    html,
    /<meta property="og:title" content="[^"]*">/,
    `<meta property="og:title" content="${t}">`
  );
  html = replaceOne(
    html,
    /<meta property="og:description" content="[^"]*">/,
    `<meta property="og:description" content="${d}">`
  );
  html = replaceOne(
    html,
    /<meta property="og:image" content="[^"]*">/,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}">`
  );
  html = replaceOne(
    html,
    /<meta name="twitter:url" content="[^"]*">/,
    `<meta name="twitter:url" content="${canonical}">`
  );
  html = replaceOne(
    html,
    /<meta name="twitter:title" content="[^"]*">/,
    `<meta name="twitter:title" content="${t}">`
  );
  html = replaceOne(
    html,
    /<meta name="twitter:description" content="[^"]*">/,
    `<meta name="twitter:description" content="${d}">`
  );
  return html;
}

const shell = readFileSync(shellPath, "utf8");

// Built by `vite build --ssr` immediately before this script runs.
const { render } = (await import(
  join(root, "dist", "server", "entry-server.js")
)) as { render: (path: string) => string };

let written = 0;

for (const path of Object.keys(SEO_BY_PATH)) {
  const body = render(path);
  if (!body.includes("<h1")) {
    throw new Error(
      `prerender-seo: ${path} rendered without an <h1> — refusing to ship an empty page`
    );
  }
  const html = buildPage(shell, path, body);

  if (path === "/") {
    writeFileSync(shellPath, html, "utf8");
    written += 1;
    console.log(`  ${path.padEnd(21)} -> dist/public/index.html`);
    continue;
  }

  // Static hosts resolve a clean URL differently: Cloudflare tries /founders,
  // then /founders.html, then /founders/index.html. Emit both file forms so the
  // right head is served whichever convention the host follows. If neither is
  // matched it falls back to the SPA shell, which is the previous behaviour.
  const slug = path.slice(1);
  for (const target of [
    join(outDir, `${slug}.html`),
    join(outDir, slug, "index.html"),
  ]) {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html, "utf8");
    written += 1;
    console.log(`  ${path.padEnd(21)} -> ${target.replace(outDir, "dist/public")}`);
  }
}

/**
 * The SPA fallback for everything that is not prerendered: funnel steps and
 * unknown paths. It keeps an empty #root (so the client mounts fresh rather
 * than trying to hydrate someone else's markup) and claims neither a canonical
 * nor an index directive, because it is served under many different URLs.
 *
 * server/index.ts and vercel.json both point their catch-all here. Serving
 * index.html instead would hand every funnel URL a copy of the home page.
 */
let fallback = shell;
fallback = replaceOne(
  fallback,
  /<meta name="robots" content="[^"]*">/,
  `<meta name="robots" content="noindex, nofollow">`
);
fallback = replaceOne(fallback, /\s*<link rel="canonical" href="[^"]*" \/>/, "");
writeFileSync(join(outDir, "app-shell.html"), fallback, "utf8");
written += 1;
console.log(`  ${"(spa fallback)".padEnd(21)} -> dist/public/app-shell.html`);

console.log(`prerender-seo: wrote ${written} pages`);
