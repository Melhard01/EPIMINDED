# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (`packageManager` pin + a patched `wouter`; use `pnpm install`, not npm).

```bash
pnpm dev          # concurrently: vite on :3000 + tsx watch API on :3001
pnpm dev:web      # vite only (API calls will 404 unless :3001 is up)
pnpm dev:api      # express only, loads .env.local
pnpm build        # build:client + esbuild server -> dist/index.js
pnpm build:client # vite build -> dist/public, vite --ssr -> dist/server, then prerender-seo
pnpm build:vercel # alias of build:client (what Vercel runs)
pnpm start        # run the bundled prod server (serves dist/public + API)
pnpm start:local  # same, with .env.local loaded
pnpm preview      # serve a built dist/public without the API
pnpm check        # tsc --noEmit — the only static check in the repo
pnpm format       # prettier --write .
```

There is no test suite (vitest is installed but unused, and `.project-config.json`'s `pnpm test` script does not exist). `pnpm check` is the gate before committing.

Copy `.env.example` → `.env.local` before running the API; the funnel routes read Polar keys and upstream auth/community/subscription base URLs from it. Both files are gitignored, so a fresh clone has neither — the defaults compiled into `server/funnel/routes.ts` are what an unconfigured checkout uses.

## Architecture

Marketing site + acquisition funnel in one Vite SPA, with a small Express BFF beside it.

### Two apps, one bundle

`client/src/App.tsx` splits routing into two worlds:

- **Marketing pages** (`/`, `/founders`, `/community-builders`, `/enterprise`, `/legal/*`) — rendered inside `PageBackground` + `CookieBanner`, styled by the global Tailwind v4 theme in `client/src/index.css` (Epineon ivory/gold tokens, `.dark` forced on the root div).
- **Funnel pages** (`/quiz`, `/report`, `/paywall`, `/pre-checkout/*`, `/success`) — wrapped in [FunnelShell.tsx](client/src/funnel/FunnelShell.tsx), which mounts `FunnelProvider` and imports `funnel.css`. The funnel has its **own** design system scoped under `.funnel-root` (SOULCHAIN black/gold, Fraunces/Inter Tight) that deliberately shadows global token names like `--color-card` and `--font-sans`. `client/src/funnel/tailwind.tokens.ts` documents those tokens but is not wired into the Tailwind v4 build — funnel styling lives in the CSS files.

`isFunnelPath()` in App.tsx must be kept in sync with the funnel `<Route>` list, otherwise a funnel page gets the marketing background and cookie banner.

Routing is **wouter** (patched). Vercel rewrites everything to `index.html` (`vercel.json`), and `wrangler.jsonc` exists for a Cloudflare-assets deploy of the same static output.

### Static prerendering (SEO/GEO)

The marketing routes are **statically generated at build time**, not client-rendered. The pipeline is three steps, all in `build:client`:

1. `vite build` → the client bundle and the app shell in `dist/public`.
2. `vite build --ssr src/entry-server.tsx` → `dist/server/entry-server.js`, which exports `render(path)`. It renders the same `<App />` the browser boots, wrapped in wouter's `<Router ssrPath>`.
3. `tsx scripts/prerender-seo.ts` → calls `render()` per route, injects the markup into `<div id="root">`, patches the head, and writes `<slug>.html` + `<slug>/index.html`. **It throws if a route renders without an `<h1>`**, so a regression fails the build rather than silently shipping an empty page.

`client/src/main.tsx` picks `hydrateRoot` when `#root` already has markup and `createRoot` otherwise.

Three invariants that are easy to break:

- **Nothing may touch a browser API during render.** Effects, refs and lazy chunks are fine; `useState` initializers are not. `LanguageContext` reads `localStorage` in an effect for exactly this reason — moving it back into the initializer breaks the build and desyncs hydration.
- **No `crossorigin` on same-origin `/assets/*` tags.** Vite stamps it on the entry chunk and its stylesheet; it makes the fetch CORS-mode, and `/assets/*` answers without `Access-Control-Allow-Origin`, so any client that treats the request as cross-origin drops the stylesheet and renders the page with **no CSS at all** — text and images still arrive, so it reads as "unstyled", not "broken". `legacyCss()` strips the attribute in a `transformIndexHtml` post hook, and `client/public/_headers` / `vercel.json` / `server/index.ts` send the header; either half alone is sufficient, keep both. The `crossorigin` on the `fonts.gstatic.com` preconnect is correct and must stay.
- **`EffectBoundary` gates the WebGL backgrounds behind `componentDidMount`.** Those are `lazy()` chunks whose Suspense boundary cannot resolve on the server; rendering them unconditionally throws React #419 on hydration. Every `lazy()` in the app must stay inside an `EffectBoundary`.

`dist/public/app-shell.html` is the SPA fallback for funnel and unknown paths: empty `#root`, `noindex`, no canonical. Both `server/index.ts` and `vercel.json` point their catch-all at it — **not** `index.html`, which now holds the prerendered home page and would otherwise be served under every funnel URL. `express.static` needs `extensions: ["html"]` so `/founders` resolves `founders.html` before hitting that catch-all.

`vite.config.ts` keeps `jsxLocPlugin` and `vitePluginManusRuntime` **dev-only**. The latter inlines ~366kB of script into the document; in a prerendered page that is 89% of the bytes, sitting ahead of the content.

#### Metadata: one source of truth, three consumers

[client/src/lib/seo.ts](client/src/lib/seo.ts) holds `SEO_BY_PATH` (title/description per public route) plus `seoForPath()`, and is read by three places that must stay consistent:

1. **`RouteSeo`** ([client/src/components/RouteSeo.tsx](client/src/components/RouteSeo.tsx)) — mounted once in `App.tsx`, patches `document.head` on every wouter location change. Covers client-side navigation after the first load.
2. **`scripts/prerender-seo.ts`** — see above. It **regex-replaces tags in the built shell and throws if a tag no longer matches**, so editing the `<head>` of `client/index.html` can break the build — the tags it patches must keep their exact attribute order and quoting.
3. **`client/public/sitemap.xml`** — hand-maintained, not generated from `SEO_BY_PATH`.

`SITE_ORIGIN` is hardcoded to `https://soulchain.net` on purpose: `VITE_SITE_URL` is localhost in dev, and leaking that into `canonical`/`og:url` would deindex the site. Anything not in `SEO_BY_PATH` (funnel steps, unknown paths) resolves to `noindex, nofollow`.

**Adding a public marketing route touches four files**: the `<Route>` in `App.tsx`, `SEO_BY_PATH` (which is also what drives prerendering — a route absent from it is never prerendered), `sitemap.xml`, and — if it should stay out of the index — `client/public/robots.txt` and the `NOINDEX_PREFIXES` list in `seo.ts`.

`vercel.json` rewrites `/(.*)` → `/app-shell.html`; static files take precedence over that rewrite, which is what lets the prerendered per-route HTML win.

### The Express BFF (`server/`)

`server/index.ts` mounts [server/funnel/routes.ts](server/funnel/routes.ts) — everything under `/api/*` plus `GET /checkout`. It is a thin **proxy/adapter over external services**, not a data owner:

- `/api/auth/{login,register,verify-otp,resend-verification,join-community-by-code}` → forwards to `AUTH_API_BASE_URL` (default `http://40.89.185.79:4006`) / the community service on `:5044`, normalising field names (`firstName` → `first_name`, `otp` → `verificationCode`) and collapsing upstream `detail` into `message`. `verify-otp` falls back to a legacy upstream path on 404.
- `/api/communities/request` → lead capture, `community_type` restricted to `founders|community_builders|organisations`.
- `GET /checkout` → creates a Polar checkout and 302s to it; product IDs come from `POLAR_PRODUCT_<OFFER>_<INTERVAL>` env vars via `polarProductIdFor()`. Rejects emails whose domain has no MX record.
- `/api/webhook/polar` → verifies the signature against the raw body (captured by the `express.json` `verify` hook in `server/index.ts` — don't remove it) and PUTs `payment_status` to `SUBSCRIPTION_API_BASE_URL`.
- `/api/provision` → `server/funnel/lib/provision.ts`, which is an **in-memory mock** account store that mints a signed entitlement JWT (`ENTITLEMENT_TOKEN_SECRET`). Replace the `Map` with a real store before this is load-bearing.

In dev, Vite proxies `/api` and `/checkout` to `:3001`. **The Vercel deployment builds the client and prerendered HTML only** — none of these routes exist there, so any feature depending on them needs the Express server hosted separately or ported. That is why [RequestCommunityForm.tsx](client/src/components/RequestCommunityForm.tsx) posts straight to the community service instead of through `/api/communities/request`; `VITE_COMMUNITY_REQUEST_URL` switches it back to the BFF.

The upstream hosts serve TLS with **self-signed certificates**, which both browsers and Node's `fetch` reject by default. Expect `/api/auth/*` to return the `AUTH_SERVICE_UNAVAILABLE` 502 branch, and the direct-from-browser lead post to fail, until those hosts carry a certificate from a trusted CA.

### Duplicated funnel lib

`server/funnel/lib/` and `client/src/funnel/lib/` hold near-identical copies of `config.ts`, `plans.ts`, `pricing.ts`, `provision.ts`, `entitlement/`, `money.ts`, `clsx.ts`. The only intended differences are import paths (`./x` vs `@/funnel/lib/x`) and env access (`process.env` vs `import.meta.env`). **Changes to pricing, offers, or entitlement logic must be applied to both copies.**

### Client state and cross-cutting providers

Provider order in `App.tsx`: `ErrorBoundary → ThemeProvider → SmoothScrollProvider → LanguageProvider → ApplicationModalProvider → TooltipProvider`.

- **Funnel state** — `client/src/funnel/lib/funnel/store.tsx`, persisted to `sessionStorage` under `epiminded.funnel.v1` (quiz answers → profile → selected offer → email → orderRef). Purely UX continuity; the entitlement token is the only server-trusted artifact.
- **i18n** — hand-rolled: a flat key→string map in [client/src/i18n/translations.ts](client/src/i18n/translations.ts) (`en` + `fr`) consumed via `useLanguage().t(key)`. Missing keys render the key itself. Add every new string to **both** locales.
- **Smooth scroll** — Lenis, created once in [SmoothScrollProvider.tsx](client/src/contexts/SmoothScrollProvider.tsx) and exposed through the module singleton in `client/src/lib/smoothScroll.ts`; scroll helpers (`navScroll`, `scrollToApply`, `scrollToPartner`, `ScrollToHash`) go through `getLenis()` and fall back to native scroll. The provider re-dispatches a native `scroll` event with a re-entrancy guard — keep it.
- **Auth token** — `client/src/lib/authToken.ts` reads/writes a small allowlist of storage keys and extracts a JWT from several upstream response shapes.

### UI conventions

shadcn/ui "new-york" in `client/src/components/ui/` (aliases in `components.json`); marketing sections are top-level components in `client/src/components/` composed by page files in `client/src/pages/`. A few heavier sections pair a `.tsx` with a co-located `.module.css`. Backgrounds live in `client/public/assets/`; several use OGL/three-based effects (`HeroAuroraBackground`, `Orb`).

Path aliases: `@/*` → `client/src/*`, `@shared/*` → `shared/*`.

Prettier config is non-default (`printWidth: 80`, `arrowParens: "avoid"`, `trailingComma: "es5"`) but most of the codebase predates it — don't reformat files you aren't otherwise touching.

## Notes

- `.project-config.json` is a leftover Manus scaffold file (gitignored) containing credentials; `vite.config.ts` still carries the Manus runtime plugins and a `/manus-storage` presign proxy. Neither is used by the Vercel deploy.
- `ideas.md` is early brand brainstorming under the old "SOULCHAIN" name. That name still appears throughout `translations.ts` copy, and in `seo.ts` as `SITE_NAME`/`SITE_ORIGIN` (`soulchain.net`) plus every title and `sitemap.xml` URL; the product is EpiMinded. The SEO values track the live domain, so don't rename them as part of a copy cleanup.
