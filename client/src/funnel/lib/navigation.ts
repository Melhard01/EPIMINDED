import { useLocation } from "wouter";

/** Navigate helper compatible with Next useRouter().push / .replace */
export function useRouter() {
  const [, setLocation] = useLocation();
  return {
    push: (path: string) => setLocation(path),
    replace: (path: string) => setLocation(path, { replace: true }),
  };
}

/** Read current URL search params (works with wouter + full page URLs). */
export function useSearchParams() {
  const [location] = useLocation();
  const query = (() => {
    if (typeof window !== "undefined" && window.location.search) {
      return window.location.search;
    }
    const idx = location.indexOf("?");
    return idx >= 0 ? location.slice(idx) : "";
  })();
  return new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
}
