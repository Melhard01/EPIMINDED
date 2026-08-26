import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import "lenis/dist/lenis.css";
import "./index.css";

// Before render so the first page_viewed from RouteAnalytics is captured.
initAnalytics();

const container = document.getElementById("root")!;

// Prerendered routes ship real markup inside #root, so they hydrate. Routes
// served the bare shell (the funnel, unknown paths) still mount from scratch.
if (container.firstElementChild) {
  hydrateRoot(container, <App />);
} else {
  createRoot(container).render(<App />);
}
