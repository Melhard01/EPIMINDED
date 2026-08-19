import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
  mounted: boolean;
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
 *
 * It is also the client-only gate for these effects. The children are
 * `lazy()` imports of WebGL code that cannot run during the build-time render;
 * left ungated, their Suspense boundary never resolves on the server and React
 * throws #419 on hydration and re-renders the subtree. Rendering nothing until
 * mount keeps the server output and the first client render identical. The
 * backgrounds are decorative and `aria-hidden`, so arriving a tick later costs
 * nothing.
 */
export default class EffectBoundary extends Component<Props, State> {
  state: State = { failed: false, mounted: false };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentDidCatch(error: unknown) {
    console.warn("[EffectBoundary] background effect disabled:", error);
  }

  render() {
    if (this.state.failed || !this.state.mounted) return null;
    // Gating on mount means the background appears a frame after the page.
    // Fading it in stops that from reading as a flash.
    return <div className="effect-fade-in">{this.props.children}</div>;
  }
}
