import { useEffect } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { applySeo } from "@/lib/seo";

/**
 * Keeps the document head in sync with the active route and language.
 * Renders nothing, so it has no effect on layout or styling.
 */
export default function RouteSeo() {
  const [location] = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    applySeo(location, language);
  }, [location, language]);

  return null;
}
