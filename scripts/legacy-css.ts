import type { Plugin } from "vite";
import postcss, { AtRule, type ChildNode, type Root } from "postcss";
import cascadeLayers from "@csstools/postcss-cascade-layers";

/**
 * Makes the built stylesheet readable by WebKit older than Tailwind v4's own
 * floor (Safari 16.4), without changing what modern browsers render.
 *
 * Runs on the emitted CSS asset rather than in Vite's css pipeline, so it
 * composes with the Lightning CSS transformer instead of replacing it:
 * Lightning CSS downlevels syntax it can compute (nesting, oklch, logical
 * properties), and the two transforms here handle what it cannot.
 *
 * 1. Cascade layers.
 *
 *    `@layer` arrived in Safari 15.4. An older engine does not merely ignore
 *    the ordering, it skips the whole at-rule — and Tailwind v4 puts theme,
 *    base, components and utilities inside layers, which is 84% of this
 *    stylesheet. That is why the page rendered with no styling at all.
 *
 *    Flattening is not a matter of deleting the wrappers. Layered rules lose
 *    to unlayered ones no matter their specificity, and later layers beat
 *    earlier ones the same way, so simply unwrapping would let the app's own
 *    unlayered CSS stop winning and let base rules start beating utilities.
 *    @csstools/postcss-cascade-layers rewrites selectors to reproduce the
 *    layer order through specificity instead, which is the transform browsers
 *    without @layer need.
 *
 *    That plugin assumes every rule lives in a layer. This stylesheet is
 *    mixed: Tailwind's output is layered, the app's own 40kB of CSS is not,
 *    and unlayered rules outrank every layer. Handing it the sheet as-is
 *    bumped Tailwind's `.container` to `:not(#\\#)` x3 while the app's
 *    unlayered `.container` stayed at one class, so Tailwind's max-width
 *    started winning and every line of body copy re-wrapped. The unlayered
 *    rules are therefore collected into a final layer first, which is the
 *    position the cascade already gives them.
 *
 * 2. color-mix().
 *
 *    Tailwind compiles an opacity modifier (`bg-white/10`) to a rule guarded
 *    by `@supports (color: color-mix(in lab, red, red))`. color-mix() landed
 *    in Safari 16.2, so below that the condition is false and the browser
 *    skips the entire block — losing the navbar, the logo plate, the buttons
 *    and the cookie banner.
 *
 *    A fallback inside the block is skipped with it, so a plain rgba() rule is
 *    emitted immediately *before* each guarded block, resolving the custom
 *    property itself. Browsers that support color-mix() parse both; the
 *    guarded rule comes second at equal specificity and wins, so their
 *    rendering is unchanged.
 *
 * 3. Two smaller gaps, same pattern — emit the old form first, keep the modern
 *    one after it:
 *
 *    - `svh`/`dvh` units (Safari 15.4) get a `vh` fallback declaration.
 *    - `:is(.dark *)` (Safari 14) is rewritten to a plain descendant
 *      combinator. `.x:is(.dark *)` and `.dark .x` both compute to one class
 *      plus one class, so the specificity is unchanged.
 */

type Rgb = { r: number; g: number; b: number };

const NAMED: Record<string, Rgb> = {
  white: { r: 255, g: 255, b: 255 },
  black: { r: 0, g: 0, b: 0 },
};

function parseColor(value: string): Rgb | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3,8})$/i.exec(v);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map(c => c + c).join("");
    if (h.length < 6) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const fn = /^rgba?\(\s*([0-9.]+)[\s,]+([0-9.]+)[\s,]+([0-9.]+)/i.exec(v);
  if (fn) return { r: +fn[1], g: +fn[2], b: +fn[3] };
  return NAMED[v.toLowerCase()] ?? null;
}

/**
 * `--name: value` pairs, var() chains followed to a concrete colour.
 *
 * `.dark` definitions win: the theme declares the light palette on :root and
 * overrides it under `.dark`, and this site renders dark-only. Taking the
 * first definition resolves --background to the light #f8f6f0 and paints the
 * cookie banner and the hero pill nearly white.
 */
function buildVarMap(css: string): Map<string, string> {
  const raw = new Map<string, string>();
  for (const block of css.matchAll(/\.dark\b[^{}]*\{([^{}]*)\}/g)) {
    for (const m of block[1].matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;}]+)/g)) {
      if (!raw.has(m[1])) raw.set(m[1], m[2].trim());
    }
  }
  for (const m of css.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;}]+)/g)) {
    if (!raw.has(m[1])) raw.set(m[1], m[2].trim());
  }

  const resolved = new Map<string, string>();
  const resolve = (name: string, seen: Set<string>): string | null => {
    if (resolved.has(name)) return resolved.get(name)!;
    if (seen.has(name)) return null;
    seen.add(name);
    const value = raw.get(name);
    if (!value) return null;
    const ref = /^var\(\s*(--[A-Za-z0-9_-]+)\s*\)$/.exec(value);
    const out = ref ? resolve(ref[1], seen) : value;
    if (out) resolved.set(name, out);
    return out;
  };
  for (const name of raw.keys()) resolve(name, new Set());
  return resolved;
}

/**
 * Moves everything that is not already in a layer into one final layer.
 *
 * Layer order is first-appearance order, so appending this block last gives it
 * the highest priority among layers — matching the precedence unlayered rules
 * had to begin with. @charset/@import must stay at the top of the sheet and
 * are left alone.
 */
function layerTheUnlayered(root: Root): number {
  const strays: ChildNode[] = [];
  root.each(node => {
    if (node.type === "atrule") {
      const name = node.name.toLowerCase();
      if (name === "layer" || name === "charset" || name === "import") return;
    }
    if (node.type === "comment") return;
    strays.push(node);
  });
  if (!strays.length) return 0;

  const layer = new AtRule({ name: "layer", params: "legacy-unlayered" });
  for (const node of strays) {
    node.remove();
    layer.append(node);
  }
  root.append(layer);
  return strays.length;
}

/** Index just past the `}` closing the block whose `{` is at `open`. */
function matchBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

const DECL =
  /([a-z-]+)\s*:\s*color-mix\(\s*in\s+[a-z]+\s*,\s*var\(\s*(--[A-Za-z0-9_-]+)\s*\)\s*([0-9.]+)%\s*,\s*transparent\s*\)/gi;

function fallbackFor(body: string, vars: Map<string, string>): string {
  let out = "";
  for (const rule of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = rule[1].trim();
    const decls: string[] = [];
    for (const d of rule[2].matchAll(DECL)) {
      const value = vars.get(d[2]);
      const rgb = value ? parseColor(value) : null;
      if (!rgb) continue;
      const a = Math.round((parseFloat(d[3]) / 100) * 1000) / 1000;
      decls.push(`${d[1]}:rgba(${rgb.r},${rgb.g},${rgb.b},${a})`);
    }
    if (decls.length) out += `${selector}{${decls.join(";")}}`;
  }
  return out;
}

/**
 * `height:100svh` -> `height:100vh` first, then the original.
 *
 * Safari gained the small/large/dynamic viewport units in 15.4; older versions
 * drop the declaration. 100vh is what the design used before those units
 * existed, so it is the right fallback rather than a guess.
 */
function addViewportUnitFallbacks(css: string): { css: string; added: number } {
  let added = 0;
  const out = css.replace(
    /(^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]*\b100[sd]vh\b[^;{}]*)/gi,
    (whole, lead: string, prop: string, value: string) => {
      const legacy = value.replace(/\b100[sd]vh\b/gi, "100vh");
      if (legacy === value) return whole;
      added += 1;
      return `${lead}${prop}:${legacy};${prop}:${value}`;
    },
  );
  return { css: out, added };
}

/**
 * `.x:is(.dark *)` -> `.dark .x`.
 *
 * :is() is Safari 14. Tailwind emits this shape for every dark-mode variant,
 * and this site renders dark-only, so losing them on 12/13 would strip the
 * whole palette. The rewrite is specificity-neutral: :is() takes the
 * specificity of its most specific argument, which here is one class.
 */
function rewriteDarkIs(css: string): { css: string; added: number } {
  let added = 0;
  const out = css.replace(/([^{},]+?):is\(\.dark \*\)/g, (whole, sel: string) => {
    const base = sel.trim();
    if (!base || base.includes(":is(")) return whole;
    added += 1;
    return `.dark ${base}`;
  });
  return { css: out, added };
}

function addColorMixFallbacks(css: string): { css: string; added: number } {
  const vars = buildVarMap(css);
  let out = "";
  let i = 0;
  let added = 0;

  for (;;) {
    const at = css.indexOf("@supports", i);
    if (at === -1) {
      out += css.slice(i);
      break;
    }
    const open = css.indexOf("{", at);
    if (open === -1) {
      out += css.slice(i);
      break;
    }
    const condition = css.slice(at, open);
    const end = matchBrace(css, open);
    if (end === -1 || !/color-mix\(/i.test(condition)) {
      out += css.slice(i, open + 1);
      i = open + 1;
      continue;
    }
    const fallback = fallbackFor(css.slice(open + 1, end - 1), vars);
    if (fallback) added += 1;
    out += css.slice(i, at) + fallback + css.slice(at, end);
    i = end;
  }
  return { css: out, added };
}

export function legacyCss(): Plugin {
  return {
    name: "legacy-css",
    // `post` so Lightning CSS has already run: what is seen here ships.
    enforce: "post",
    apply: "build",

    /**
     * Vite stamps `crossorigin` on the tags it injects for the entry chunk and
     * its stylesheet. On a same-origin asset that attribute buys nothing and
     * can cost the entire stylesheet: it makes the fetch CORS-mode, and
     * `/assets/*` answers without `Access-Control-Allow-Origin`, so any client
     * that treats the request as cross-origin rejects the sheet outright and
     * renders the page with no CSS at all. Text and images still arrive — they
     * are not CORS-mode — which is why the symptom reads as "unstyled" rather
     * than "broken".
     *
     * Reproduced in WebKit against the live page: with the attribute, `body`
     * computed `rgba(0,0,0,0)` and `-webkit-standard`; with it removed and
     * nothing else changed, `rgb(8,8,8)` and `Inter, sans-serif`.
     *
     * Only root-relative `/assets/...` tags are touched — same-origin by
     * construction. A genuinely cross-origin asset host still needs the
     * attribute and keeps it. See also the `_headers` entry, which fixes the
     * other half (the missing CORS header) for hosts that read it.
     */
    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        return html.replace(/<(?:link|script)\b[^>]*>/g, tag =>
          / (?:href|src)="\/assets\//.test(tag)
            ? tag.replace(/\s+crossorigin(?:="[^"]*")?/g, "")
            : tag,
        );
      },
    },
    async generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".css")) continue;
        const input = typeof file.source === "string" ? file.source : file.source.toString();

        const layersBefore = (input.match(/@layer/g) ?? []).length;

        const root = postcss.parse(input, { from: undefined });
        const moved = layerTheUnlayered(root);
        const flattened = await postcss([cascadeLayers({ onRevertLayerKeyword: "warn" })])
          .process(root.toString(), { from: undefined });

        const mixed = addColorMixFallbacks(flattened.css);
        const viewport = addViewportUnitFallbacks(mixed.css);
        const darkIs = rewriteDarkIs(viewport.css);
        const css = darkIs.css;
        const added = mixed.added;
        file.source = css;

        const layersAfter = (css.match(/@layer/g) ?? []).length;
        this.info(
          `legacy-css: ${file.fileName} — @layer ${layersBefore} -> ${layersAfter}, ` +
            `${moved} unlayered nodes moved into a final layer, ` +
            `${added} color-mix fallback rules, ` +
            `${viewport.added} svh/dvh fallbacks, ` +
            `${darkIs.added} :is(.dark *) rewrites`,
        );
      }
    },
  };
}
