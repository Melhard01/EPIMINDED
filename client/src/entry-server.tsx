/**
 * Build-time render entry. Consumed by scripts/prerender-seo.ts, never shipped
 * to the browser.
 *
 * The same <App /> the browser boots is rendered here against a fixed path, so
 * crawlers receive the real page markup instead of an empty shell. Anything
 * that needs a browser (WebGL backgrounds, Lenis, IntersectionObserver) lives
 * in effects or lazy chunks, which do not run during renderToString.
 */
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

export function render(path: string): string {
  return renderToString(
    <Router ssrPath={path}>
      <App />
    </Router>
  );
}
