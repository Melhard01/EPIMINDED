/**
 * Emits a per-route index.html so each public page serves its own canonical,
 * title, description and Open Graph tags in the initial HTML.
 *
 * Without this, an SPA serves one index.html for every route, so /founders was
 * served with `canonical -> https://soulchain.net/`. That tells Google the page
 * is a duplicate of the home page. RouteSeo corrects it after hydration, but
 * only for crawlers that execute JS — and it cannot help social scrapers, which
 * never run any.
 *
 * Each generated file is the untouched app shell with only <head> values
 * swapped, so the same bundle boots and renders the same route as before. No
 * markup, styling or behaviour changes.
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

function buildPage(shell: string, path: string): string {
  const { title, description } = SEO_BY_PATH[path];
  const canonical = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
  const t = esc(title);
  const d = esc(description);

  let html = shell;
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
let written = 0;

for (const path of Object.keys(SEO_BY_PATH)) {
  const html = buildPage(shell, path);

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

console.log(`prerender-seo: wrote ${written} pages`);
