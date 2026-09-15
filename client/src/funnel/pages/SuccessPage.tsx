import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "@/funnel/lib/navigation";
import { BrandHeader } from "@/funnel/components/ui/BrandHeader";
import {
  MultiRailHandoff,
  type VerifiedPurchase,
} from "@/funnel/components/handoff/MultiRailHandoff";
import { useFunnel } from "@/funnel/lib/funnel/store";
import { getAuthAccessToken } from "@/lib/authToken";
import { track } from "@/lib/analytics";

const SUPPORT_EMAIL = "support@epiminded.app";
// Polar reports "confirmed" while a charge settles; it turns "succeeded" within seconds.
const PROCESSING_RECHECKS = 5;
const PROCESSING_RECHECK_MS = 3000;

const BUTTON_CLASS =
  "mt-6 inline-flex h-10 items-center justify-center rounded-full border border-line bg-card px-5 font-sans text-[14px] font-semibold text-body transition hover:border-gold sm:h-12 sm:px-6 sm:text-[15px]";

type PaymentReply = {
  status?: string;
  offer_id?: string;
  purchase?: VerifiedPurchase;
  recorded?: boolean;
};

type View =
  | { kind: "checking" }
  | { kind: "paid"; purchase: VerifiedPurchase; recorded: boolean }
  | { kind: "processing" }
  | { kind: "failed"; message: string; action: "retry" | "plans" | null };

function failureView(status: string | undefined): View {
  if (status === "unpaid") {
    return {
      kind: "failed",
      message:
        "This payment wasn't completed, so your membership isn't active. You can go back to the plans and try again.",
      action: "plans",
    };
  }
  if (status === "not_found" || status === "invalid") {
    return {
      kind: "failed",
      message: `We couldn't verify this order. If you were charged, contact ${SUPPORT_EMAIL} with the order reference below.`,
      action: null,
    };
  }
  return {
    kind: "failed",
    message: "We couldn't confirm your payment right now. Please try again in a moment.",
    action: "retry",
  };
}

function SuccessInner() {
  const searchParams = useSearchParams();
  const checkoutId =
    searchParams.get("checkout_id") || searchParams.get("checkoutId");
  const { registeredUserId, markPaid } = useFunnel();
  const [view, setView] = useState<View>(() =>
    checkoutId
      ? { kind: "checking" }
      : {
          kind: "failed",
          message: `This page has no order reference. If you were charged, contact ${SUPPORT_EMAIL}.`,
          action: null,
        },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!checkoutId) return;
    let cancelled = false;
    // Only the checkout id and the buyer's own login token leave the browser;
    // the server reads status, plan and account back from Polar.
    const token = getAuthAccessToken();

    fetch(`/api/polar/payment/${encodeURIComponent(checkoutId)}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (res) => {
        const reply = (await res.json().catch(() => ({}))) as PaymentReply;
        if (cancelled) return;

        if (reply.status === "paid" && reply.purchase) {
          setView({ kind: "paid", purchase: reply.purchase, recorded: Boolean(reply.recorded) });
          markPaid(checkoutId);
          track("checkout_completed", {
            route: "/success",
            checkout_id: checkoutId,
            plan: reply.offer_id,
            billing_cycle: reply.purchase.interval,
            user_id: registeredUserId ?? undefined,
            activation_recorded: Boolean(reply.recorded),
          });
          track("onboarding_completed", {
            route: "/success",
            checkout_id: checkoutId,
            plan: reply.offer_id,
          });
          return;
        }

        if (reply.status === "processing") {
          setView({ kind: "processing" });
          if (attempt < PROCESSING_RECHECKS) {
            setTimeout(() => {
              if (!cancelled) setAttempt((n) => n + 1);
            }, PROCESSING_RECHECK_MS);
          }
          return;
        }

        setView(failureView(reply.status));
        track("checkout_failed", {
          route: "/success",
          reason: reply.status ?? `http_${res.status}`,
          checkout_id: checkoutId,
        });
      })
      .catch(() => {
        if (!cancelled) setView(failureView(undefined));
      });

    return () => {
      cancelled = true;
    };
  }, [checkoutId, attempt, markPaid, registeredUserId]);

  const recheck = () => {
    setView({ kind: "checking" });
    setAttempt((n) => n + 1);
  };

  if (view.kind === "paid") {
    return (
      <>
        {!view.recorded && (
          <p className="mx-auto mb-6 max-w-[36em] rounded-xl border border-[#6b3d3d] bg-[#241515] px-4 py-3 text-center text-sm text-[#f0bbbb]">
            Your payment is confirmed, but we couldn&apos;t finish activating your account.
            If the app asks you to pay, contact{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>{" "}
            with order reference {checkoutId}.
          </p>
        )}
        <MultiRailHandoff purchase={view.purchase} />
      </>
    );
  }

  return (
    <div className="animate-rise text-center">
      {view.kind === "checking" && <p className="kicker mb-[18px]">You&apos;re in</p>}
      <h1 className="m-0 font-display text-[clamp(28px,5vw,40px)] font-semibold leading-[1.1] text-paper">
        {view.kind === "checking"
          ? "Payment successful"
          : view.kind === "processing"
            ? "Your payment is processing"
            : "We couldn’t confirm your payment"}
      </h1>
      <p className="mx-auto mt-4 max-w-[28em] text-[17px] leading-[1.6] text-ash">
        {view.kind === "checking"
          ? "Thank you for subscribing to SOULCHAIN. We are activating your access and preparing your install options now."
          : view.kind === "processing"
            ? "Your bank is still confirming the charge. This page updates automatically."
            : view.message}
      </p>
      {view.kind === "checking" && (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-label text-muted">
          Activating your membership...
        </p>
      )}
      {((view.kind === "failed" && view.action === "retry") ||
        (view.kind === "processing" && attempt >= PROCESSING_RECHECKS)) && (
        <button type="button" onClick={recheck} className={BUTTON_CLASS}>
          Check again
        </button>
      )}
      {view.kind === "failed" && view.action === "plans" && (
        <a href="/paywall" className={BUTTON_CLASS}>
          Back to plans
        </a>
      )}
      {checkoutId && (
        <p className="mt-6 font-mono text-[11px] uppercase tracking-label text-muted">
          Order ref · {checkoutId}
        </p>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader step={2} />
      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8 sm:px-8">
        <Suspense fallback={null}>
          <SuccessInner />
        </Suspense>
      </main>
    </div>
  );
}
