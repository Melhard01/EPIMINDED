import type { Plugin } from "vite";

/**
 * Gives Safari below 16.2 a usable colour for every rule Tailwind guards
 * behind `@supports (color: color-mix(...))`.
 *
 * Tailwind v4 compiles an opacity modifier (`bg-white/10`, `border-gold/40`)
 * to a guarded rule:
 *
 *   @supports (color: color-mix(in lab, red, red)) {
 *     .glass { background-color: color-mix(in oklab, var(--color-white) 10%, transparent) }
 *   }
 *
 * color-mix() landed in Safari 16.2, so on iOS 15.4-16.1 the @supports
 * condition is false and the browser skips the whole block — which is why the
 * navbar, the logo plate, the buttons and the cookie banner disappeared there.
 * A fallback declaration placed *inside* the block is skipped with it, so the
 * fallback rule has to be emitted outside, immediately before:
 *
 *   .glass { background-color: rgba(255,255,255,0.1) }
 *   @supports (color: color-mix(...)) { .glass { background-color: color-mix(...) } }
 *
 * Browsers that support color-mix() read both; the guarded rule comes second at
 * equal specificity, so it wins and their rendering is unchanged. Older Safari
 * sees only the rgba() rule.
 *
 * Lightning CSS cannot do this: the colour arrives as a `var()`, so there is
 * nothing for it to compute. Here the variables have already been emitted into
 * the same stylesheet and can be resolved.
 *
 * Only `var(--name) <pct>%, transparent` is handled — the shape Tailwind's
 * opacity modifiers produce. Anything else (currentcolor, nested mixes,
 * unresolvable variables) is left alone, which is no worse than today.
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
 * `--name: value` pairs, with var() chains followed to a concrete colour.
 *
 * Definitions inside a `.dark` scope win. The theme declares the light palette
 * on :root and overrides it under `.dark`, and this site renders dark-only
 * (App.tsx forces the class, and globals set color-scheme: dark). Taking the
 * first definition would resolve --background to the light #f8f6f0 and paint
 * the cookie banner and the hero pill nearly white on older Safari.
 */
function buildVarMap(css: string): Map<string, string> {
  const raw = new Map<string, string>();

  // Dark-scope definitions first, so they are the ones that stick.
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

const DECL = /([a-z-]+)\s*:\s*color-mix\(\s*in\s+[a-z]+\s*,\s*var\(\s*(--[A-Za-z0-9_-]+)\s*\)\s*([0-9.]+)%\s*,\s*transparent\s*\)/gi;

/** Rebuilds the inner rules of a guarded block using static rgba() values. */
function fallbackFor(body: string, vars: Map<string, string>): string {
  let out = "";
  // body is a sequence of `selector{decls}` — minified, no nesting here.
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

export function colorMixFallback(): Plugin {
  return {
    name: "color-mix-fallback",
    // `post` so Lightning CSS has already minified: the structure seen here is
    // the structure that ships.
    enforce: "post",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "asset" || !file.fileName.endsWith(".css")) continue;
        const css = typeof file.source === "string" ? file.source : file.source.toString();
        const vars = buildVarMap(css);

        let out = "";
        let i = 0;
        let added = 0;
        const marker = "@supports";

        for (;;) {
          const at = css.indexOf(marker, i);
          if (at === -1) { out += css.slice(i); break; }
          const open = css.indexOf("{", at);
          if (open === -1) { out += css.slice(i); break; }
          const condition = css.slice(at, open);
          const end = matchBrace(css, open);
          if (end === -1 || !/color-mix\(/i.test(condition)) {
            out += css.slice(i, open + 1);
            i = open + 1;
            continue;
          }
          const body = css.slice(open + 1, end - 1);
          const fallback = fallbackFor(body, vars);
          if (fallback) added += 1;
          out += css.slice(i, at) + fallback + css.slice(at, end);
          i = end;
        }

        if (added) {
          file.source = out;
          this.info(`color-mix-fallback: unguarded fallbacks for ${added} @supports blocks in ${file.fileName}`);
        }
      }
    },
  };
}
