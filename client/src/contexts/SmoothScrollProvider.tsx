import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { setLenis } from "@/lib/smoothScroll";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      anchors: true,
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
