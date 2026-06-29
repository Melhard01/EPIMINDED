import { useEffect } from "react";
import { useLocation } from "wouter";
import { smoothScrollToId, smoothScrollToTop } from "@/lib/smoothScroll";

export default function ScrollToHash() {
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash.slice(1);

    if (hash) {
      const timer = window.setTimeout(() => {
        smoothScrollToId(hash);
      }, 100);
      return () => window.clearTimeout(timer);
    }

    smoothScrollToTop(true);
  }, [location]);

  return null;
}
