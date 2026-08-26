import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { track } from "@/lib/analytics";

const DEPTHS = [25, 50, 75, 100] as const;

/**
 * Page views, SPA route changes and scroll depth. Renders nothing.
 *
 * Mounted once in App, inside the Router, so it sees every wouter navigation
 * including redirects.
 */
export default function RouteAnalytics() {
  const [location] = useLocation();
  const previous = useRef<string | null>(null);
  // Depth milestones already sent for the current route. Reset per navigation
  // so each page reports its own funnel, and held in a ref so re-renders
  // cannot resend one.
  const sent = useRef<Set<number>>(new Set());

  useEffect(() => {
    const route = location.split("?")[0] || "/";
    const previous_route = previous.current;

    track("page_viewed", {
      page: document.title,
      route,
      previous_route,
      referrer: previous_route ? undefined : document.referrer || undefined,
    });

    // A first load is a page view but not a navigation.
    if (previous_route && previous_route !== route) {
      track("navigation", { from: previous_route, to: route, route });
    }

    previous.current = route;
    sent.current = new Set();
  }, [location]);

  useEffect(() => {
    const route = location.split("?")[0] || "/";
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // Pages shorter than the viewport have no depth to report.
      if (scrollable <= 40) return;

      const pct = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;

      for (const depth of DEPTHS) {
        if (pct >= depth && !sent.current.has(depth)) {
          sent.current.add(depth);
          track("scroll_depth", { depth, route, page: document.title });
        }
      }
    };

    // Lenis re-emits a native scroll event every frame; coalescing into one
    // rAF keeps this to a single measurement per painted frame, and the Set
    // guarantees each milestone fires at most once per route.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location]);

  return null;
}
