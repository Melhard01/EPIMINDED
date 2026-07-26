import { useEffect, useState } from "react";
import {
  PricingPlans,
  type ProductIdMap,
} from "@/funnel/components/paywall/PricingPlans";
import { BrandHeader } from "@/funnel/components/ui/BrandHeader";
import {
  polarProductIdFor,
  SHARED_FEATURES,
  TIERS,
  type BillingInterval,
  type PlanOffer,
} from "@/funnel/lib/config";
import { PaywallCanceledBanner } from "@/funnel/pages/PaywallCanceledBanner";

type PlansResponse = {
  tiers?: PlanOffer[];
  features?: string[];
};

function buildProductIdMap(offerIds: string[]): ProductIdMap {
  const intervals: BillingInterval[] = ["month", "year"];
  const map: ProductIdMap = {};
  for (const offerId of offerIds) {
    for (const interval of intervals) {
      map[`${offerId}:${interval}`] = polarProductIdFor(offerId, interval);
    }
  }
  return map;
}

export default function PaywallPage() {
  const [tiers, setTiers] = useState<PlanOffer[]>(TIERS);
  const [features, setFeatures] = useState<string[]>([...SHARED_FEATURES]);
  const [productIds, setProductIds] = useState<ProductIdMap>(() =>
    buildProductIdMap(TIERS.map((tier) => tier.id)),
  );

  useEffect(() => {
    let cancelled = false;

    fetch("/api/plans", { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`plans ${res.status}`);
        return (await res.json()) as PlansResponse;
      })
      .then((plans) => {
        if (cancelled) return;
        const nextTiers = plans.tiers?.length ? plans.tiers : TIERS;
        const nextFeatures = plans.features?.length
          ? plans.features
          : [...SHARED_FEATURES];
        setTiers(nextTiers);
        setFeatures(nextFeatures);
        setProductIds(buildProductIdMap(nextTiers.map((tier) => tier.id)));
      })
      .catch(() => {
        /* keep static fallback tiers */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={1} />
      <PaywallCanceledBanner />
      <main className="paywall-main mx-auto w-full max-w-[1240px] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 md:px-10 lg:px-20 xl:max-w-[1360px] xl:px-12 uw:max-w-[1440px] uw:px-14">
        <div className="mb-10 text-center sm:mb-14">
          <h1 className="m-0 mb-4 font-display text-[clamp(28px,5vw,48px)] font-semibold leading-[1.08] tracking-[-0.01em] text-paper">
            Unlock Your Community Experience
          </h1>
          <p className="mx-auto m-0 max-w-[36em] text-[15px] leading-[1.6] text-ash sm:text-[16px]">
            A private peer network that helps you stay ahead of what is coming — a daily
            thinking ritual paired with a cohort of matched peers no tool can give you.
            Every tier ships the full experience; pick the cadence that fits you.
          </p>
        </div>

        <PricingPlans productIds={productIds} tiers={tiers} features={features} />
      </main>
    </div>
  );
}
