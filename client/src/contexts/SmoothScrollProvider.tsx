import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { setLenis } from "@/lib/smoothScroll";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      // Lenis damps by elapsed time, so this is frame-rate independent.
      // 0.1 trails the wheel noticeably; 0.12 stays smooth but keeps the page
      // feeling attached to the input.
      lerp: 0.12,
      smoothWheel: true,
      // Was 0.8, which moved the page less than the wheel asked for and read
      // as lag. 1 matches the input.
      wheelMultiplier: 1,
      // Lenis handles in-page #hash clicks itself. Give it the same easing and
      // navbar clearance the scroll helpers use, so both routes to a section
      // behave identically.
      // Navbar clearance comes from scroll-margin-top, which Lenis honours.
      anchors: {
        duration: 1.15,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
      },
      autoRaf: true,
    });

    setLenis(lenis);

    // Lenis listens to window "scroll". Re-dispatching that event from Lenis's
    // own scroll callback re-enters onNativeScroll and blows the call stack.
    let emittingNativeScrollBridge = false;
    const onLenisScroll = () => {
      if (emittingNativeScrollBridge) return;
      emittingNativeScrollBridge = true;
      try {
        window.dispatchEvent(new Event("scroll"));
      } finally {
        emittingNativeScrollBridge = false;
      }
    };

    const unsubscribe = lenis.on("scroll", onLenisScroll);

    return () => {
      unsubscribe();
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return children;
}
