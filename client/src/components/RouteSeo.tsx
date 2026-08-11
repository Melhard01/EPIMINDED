import { useEffect } from "react";
import { useLocation } from "wouter";
import { applySeo } from "@/lib/seo";

/**
 * Keeps the document head in sync with the active route.
 * Renders nothing, so it has no effect on layout or styling.
 */
export default function RouteSeo() {
  const [location] = useLocation();

  useEffect(() => {
    applySeo(location);
  }, [location]);

  return null;
}
