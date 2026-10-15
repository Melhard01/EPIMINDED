/**
 * Pre-deploy gate for the Polar configuration.
 *
 * Checks only what can be known without talking to Polar: that the
 * environment is named explicitly, that all six product ids are present, and
 * that none of them is one of the original sandbox ids. It cannot confirm an
 * id exists in the production organisation — that needs an authenticated call
 * and a human looking at the dashboard, which is why VERIFIED_PRODUCTION_IDS
 * below is a deliberate manual acknowledgement.
 *
 *     pnpm tsx scripts/check-polar-config.ts
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The ids shipped before the production migration. Never valid on api.polar.sh. */
const SANDBOX_IDS = new Set([
  "ed645dbc-b203-4918-a8d1-9ae31dc068df",
  "e533fd93-72a2-41ec-9a8e-420ef2454481",
  "4aa020b5-a785-43ec-b864-a87c92c2933c",
  "144a19c9-17d4-40c4-96bd-3f3aa0efaea4",
  "7f3523f0-19ec-4ffe-b60c-0250b73058d0",
  "00d7d1fa-fc55-4731-91bb-db3bafdd05c8",
]);

/**
 * Set to true only once every id below has been opened in the Polar
 * production dashboard and confirmed to be the right product at the right
 * price. This is the gate that stops a live checkout going out on unverified
 * ids; nothing automated can replace looking.
 */
const VERIFIED_PRODUCTION_IDS = false;

const KEYS = [
  "POLAR_PRODUCT_LITE_MONTH", "POLAR_PRODUCT_LITE_YEAR",
  "POLAR_PRODUCT_STANDARD_MONTH", "POLAR_PRODUCT_STANDARD_YEAR",
  "POLAR_PRODUCT_PRO_MONTH", "POLAR_PRODUCT_PRO_YEAR",
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const wrangler = JSON.parse(
  readFileSync(resolve(root, "wrangler.jsonc"), "utf8").replace(/^\s*\/\/.*$/gm, ""),
) as { vars?: Record<string, string> };
const vars = wrangler.vars ?? {};

const errors: string[] = [];
const warnings: string[] = [];

const server = vars.POLAR_SERVER?.trim();
if (!server) errors.push("POLAR_SERVER is not set in wrangler.jsonc vars.");
else if (server !== "sandbox" && server !== "production") {
  errors.push(`POLAR_SERVER is "${server}". Allowed: "sandbox" or "production".`);
}

for (const key of KEYS) {
  const value = vars[key]?.trim();
  if (!value) { errors.push(`${key} is missing.`); continue; }
  if (!UUID_RE.test(value)) { errors.push(`${key} is not a UUID.`); continue; }
  if (server === "production" && SANDBOX_IDS.has(value)) {
    errors.push(`${key} is still a sandbox product id — it does not exist in production.`);
  }
}

if (server === "production") {
  // Secrets must not be vars: vars are committed and pushed.
  for (const secret of ["POLAR_WEBHOOK_SECRET", "ENTITLEMENT_TOKEN_SECRET"]) {
    if (secret in vars) warnings.push(`${secret} is a committed var. Use: wrangler secret put ${secret}`);
  }
  if ("POLAR_ACCESS_TOKEN" in vars) {
    warnings.push("POLAR_ACCESS_TOKEN is a committed var, so the live token is in git history.");
  }
  if (!VERIFIED_PRODUCTION_IDS) {
    errors.push(
      "VERIFIED_PRODUCTION_IDS is false. Confirm all six ids in the Polar production " +
        "dashboard, then set it to true in this file.",
    );
  }
}

for (const w of warnings) console.warn(`  warn   ${w}`);
for (const e of errors) console.error(`  ERROR  ${e}`);
console.log(
  errors.length === 0
    ? `\nPolar config OK (POLAR_SERVER=${server}, ${KEYS.length} product ids).`
    : `\n${errors.length} blocking problem(s). Live checkout is not safe to enable.`,
);
process.exitCode = errors.length === 0 ? 0 : 1;
