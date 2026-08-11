import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * Isolates a decorative WebGL background.
 *
 * These effects are purely cosmetic, but a throw inside one used to propagate
 * to the single app-level ErrorBoundary and replace the whole site with an
 * error screen. iOS Safari makes that likely: it discards WebGL contexts under
 * memory pressure, and a lost context turns later draw calls into exceptions.
 *
 * Suspense does not help here — it catches loading, not errors — so the effect
 * needs its own boundary. On failure this renders nothing, so the background
 * quietly disappears and the rest of the page keeps working.
 */
export default class EffectBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[EffectBoundary] background effect disabled:", error);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
