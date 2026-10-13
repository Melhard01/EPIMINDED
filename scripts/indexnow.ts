/**
 * Submit the site's URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 *
 * IndexNow is the one lever that gets Bing to recrawl on demand; Bing
 * Webmaster Tools otherwise offers no equivalent to Search Console's "Request
 * Indexing" without an account. Google does not participate.
 *
 * Ownership is proved by serving the key back at /<key>.txt, which
 * client/public/b90cfca2347eccef354a499bd3b1229c.txt does — it ships with the
 * static assets, so it is live wherever the site is.
 *
 * Deliberately not wired into the build. A submission is an outward-facing
 * call that tells search engines "this changed", and firing it on every
 * deploy — including deploys that change nothing a reader sees — is the same
 * dishonest-freshness signal as a lastmod that moves on every build. Run it
 * by hand after a real content change:
 *
 *     pnpm tsx scripts/indexnow.ts
 */
import { SEO_BY_PATH, SITE_ORIGIN } from "../client/src/lib/seo";

const KEY = "b90cfca2347eccef354a499bd3b1229c";
const HOST = new URL(SITE_ORIGIN).host;

const urlList = Object.entries(SEO_BY_PATH)
  .filter(([, seo]) => !seo.noindex)
  .map(([path]) => `${SITE_ORIGIN}${path === "/" ? "/" : path}`);

const response = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE_ORIGIN}/${KEY}.txt`, urlList }),
});

// 200 accepted, 202 accepted but key still being validated.
console.log(`IndexNow: ${response.status} ${response.statusText} — ${urlList.length} urls`);
if (!response.ok && response.status !== 202) {
  console.error(await response.text());
  process.exitCode = 1;
}
