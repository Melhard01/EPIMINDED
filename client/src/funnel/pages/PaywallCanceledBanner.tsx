

import { useEffect, useRef } from "react";
import { useSearchParams } from "@/funnel/lib/navigation";
import { track } from "@/lib/analytics";

export function PaywallCanceledBanner() {
  const canceled = useSearchParams().get("canceled");
  // Returning from Polar without paying is the only signal the client gets
  // that a checkout was abandoned. Fire once per mount.
  const reported = useRef(false);

  useEffect(() => {
    if (!canceled || reported.current) return;
    reported.current = true;
    track("checkout_failed", { route: "/paywall", reason: "canceled_by_user" });
  }, [canceled]);

  if (!canceled) return null;

  return (
    <p className="mx-auto mb-6 max-w-[1240px] px-8 text-center sm:px-12 lg:px-20">
      <span className="inline-block rounded-[11px] border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-hi">
        Checkout canceled — your plan is still here when you&apos;re ready.
      </span>
    </p>
  );
}
