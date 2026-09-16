/**
 * Same-origin API proxies for Production (Cloudflare Worker).
 *
 * Mirrors server/funnel/routes.ts so the browser keeps calling `/api/*` and
 * `/checkout`, while the edge forwards to backend.soulchain.net (and Polar).
 */

import {
  PLAN_NAME,
  SHARED_FEATURES,
  SUBSCRIPTION_PLAN_ID,
  TIERS,
  findOffer,
  mapWebPlansPayload,
  type WebPlansApiResponse,
} from "../server/funnel/lib/config";
import {
  authLoginUrl,
  authRegisterUrl,
  authResendUrl,
  authVerifyEmailUrl,
  authVerifyOtpLegacyUrl,
  communityLeadUrl,
  joinCommunityUrl,
  plansWebUrl,
  proxyUpstreamJson,
  userPaymentStatusUrl,
  userPaymentsUrl,
  userSubscriptionUrl,
  type WorkerEnv,
} from "./upstream";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_COMMUNITY_TYPES = new Set([
  "founders",
  "community_builders",
  "organisations",
]);

const POLAR_PRODUCT_FALLBACKS: Record<string, string> = {
  POLAR_PRODUCT_LITE_MONTH: "ed645dbc-b203-4918-a8d1-9ae31dc068df",
  POLAR_PRODUCT_LITE_YEAR: "e533fd93-72a2-41ec-9a8e-420ef2454481",
  POLAR_PRODUCT_STANDARD_MONTH: "4aa020b5-a785-43ec-b864-a87c92c2933c",
  POLAR_PRODUCT_STANDARD_YEAR: "144a19c9-17d4-40c4-96bd-3f3aa0efaea4",
  POLAR_PRODUCT_PRO_MONTH: "7f3523f0-19ec-4ffe-b60c-0250b73058d0",
  POLAR_PRODUCT_PRO_YEAR: "00d7d1fa-fc55-4731-91bb-db3bafdd05c8",
};

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function authUnavailable(): Response {
  return Response.json(
    {
      code: "AUTH_SERVICE_UNAVAILABLE",
      message: "Authentication service is temporarily unavailable.",
    },
    { status: 502 },
  );
}

function polarProductId(
  env: WorkerEnv,
  offerId: string,
  interval: string,
): string | undefined {
  const key =
    `POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}` as keyof WorkerEnv;
  const fromEnv = str(env[key] as string | undefined);
  if (fromEnv) return fromEnv;
  return POLAR_PRODUCT_FALLBACKS[`POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}`];
}

export async function handleCommunityRequest(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const name = str(payload.name);
  const communityType = str(payload.community_type);
  const phone = str(payload.phone);
  const email = str(payload.email).toLowerCase();

  if (
    !name ||
    name.length > 200 ||
    !ALLOWED_COMMUNITY_TYPES.has(communityType) ||
    !phone ||
    !email
  ) {
    return Response.json(
      { message: "name, community_type, phone and email are required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(communityLeadUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        community_type: communityType,
        phone,
        email,
      }),
    });
    const text = await upstream.text();
    if (!text.trim().startsWith("{")) {
      return Response.json(
        { message: "Community service is temporarily unavailable." },
        { status: 502 },
      );
    }
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return Response.json(
      { message: "Community service is temporarily unavailable." },
      { status: 502 },
    );
  }
}

export async function handleAuthLogin(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = str(payload.email).toLowerCase();
  const password = typeof payload.password === "string" ? payload.password : "";
  if (!email || !password) {
    return Response.json(
      {
        code: "INVALID_PAYLOAD",
        message: "email and password are required.",
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(authLoginUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceType: "web" }),
    });
    return proxyUpstreamJson(upstream);
  } catch {
    return authUnavailable();
  }
}

export async function handleAuthRegister(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = typeof payload.firstName === "string" ? payload.firstName : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!firstName || !lastName || !email || !password) {
    return Response.json(
      {
        code: "INVALID_PAYLOAD",
        message: "firstName, lastName, email and password are required.",
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(authRegisterUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });
    return proxyUpstreamJson(upstream);
  } catch {
    return authUnavailable();
  }
}

export async function handleAuthVerifyOtp(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email : "";
  const otp = typeof payload.otp === "string" ? payload.otp : "";
  const challengeId =
    typeof payload.challengeId === "string" ? payload.challengeId : undefined;

  if (!email || !otp) {
    return Response.json(
      { code: "INVALID_PAYLOAD", message: "email and otp are required." },
      { status: 400 },
    );
  }

  try {
    const body = JSON.stringify({
      email,
      verificationCode: otp,
      ...(challengeId ? { challengeId } : {}),
    });
    let upstream = await fetch(authVerifyEmailUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (upstream.status === 404 && !env.AUTH_VERIFY_OTP_URL?.trim()) {
      upstream = await fetch(authVerifyOtpLegacyUrl(env), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          ...(challengeId ? { challengeId } : {}),
        }),
      });
    }

    return proxyUpstreamJson(upstream);
  } catch {
    return authUnavailable();
  }
}

export async function handleAuthResend(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = str(payload.email).toLowerCase();
  if (!email) {
    return Response.json(
      { code: "INVALID_PAYLOAD", message: "email is required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(authResendUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return proxyUpstreamJson(upstream);
  } catch {
    return authUnavailable();
  }
}

export async function handleJoinCommunity(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const userId = str(payload.userId);
  const code = str(payload.code);
  if (!userId || !code) {
    return Response.json(
      { code: "INVALID_PAYLOAD", message: "userId and code are required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(joinCommunityUrl(env), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, code }),
    });
    return proxyUpstreamJson(upstream);
  } catch {
    return Response.json(
      {
        code: "AUTH_SERVICE_UNAVAILABLE",
        message: "Community service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}

export async function handlePlans(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  const fallback = {
    tiers: TIERS,
    features: [...SHARED_FEATURES],
    source: "fallback" as const,
  };

  try {
    const upstream = await fetch(plansWebUrl(env), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) {
      return Response.json(fallback, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }
    const payload = (await upstream.json()) as WebPlansApiResponse;
    const mapped = mapWebPlansPayload(payload);
    const body = mapped
      ? { tiers: mapped.tiers, features: [...SHARED_FEATURES], source: "api" }
      : fallback;
    return Response.json(body, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(fallback, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

type PolarMetadata = Record<string, string | number | boolean>;

function parseOfferId(value: string | null): "lite" | "standard" | "pro" | null {
  if (value === "lite" || value === "standard" || value === "pro") return value;
  return null;
}

function parseInterval(value: string | null): "month" | "year" | null {
  if (value === "month" || value === "year") return value;
  return null;
}

function appOrigin(env: WorkerEnv, requestUrl: URL): string {
  return (
    str(env.VITE_APP_URL) ||
    str(env.VITE_SITE_URL) ||
    str(env.NEXT_PUBLIC_APP_URL) ||
    str(env.NEXT_PUBLIC_SITE_URL) ||
    requestUrl.origin
  );
}

/**
 * Polar checkout via REST (no Node SDK) so it runs on the Workers runtime.
 * Secrets: POLAR_ACCESS_TOKEN must be set in the Cloudflare dashboard.
 */
export async function handleCheckout(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  if (request.method !== "GET") {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  const url = new URL(request.url);
  const accessToken = str(env.POLAR_ACCESS_TOKEN);
  const serverRaw = str(env.POLAR_SERVER) || "sandbox";
  const origin = appOrigin(env, url);
  const successUrl =
    str(env.SUCCESS_URL) || `${origin}/success?checkout_id={CHECKOUT_ID}`;
  const returnUrl = `${origin}/paywall`;

  if (!accessToken) {
    return Response.json(
      { error: "Missing required environment variables: POLAR_ACCESS_TOKEN" },
      { status: 500 },
    );
  }
  if (serverRaw !== "sandbox" && serverRaw !== "production") {
    return Response.json(
      {
        error:
          'Invalid POLAR_SERVER. Allowed values are "sandbox" or "production".',
      },
      { status: 500 },
    );
  }

  let metadata: PolarMetadata | undefined;
  const metadataRaw = url.searchParams.get("metadata");
  if (metadataRaw) {
    try {
      const parsed = JSON.parse(metadataRaw) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return Response.json(
          { error: "Invalid metadata parameter: expected a JSON object." },
          { status: 400 },
        );
      }
      metadata = parsed as PolarMetadata;
    } catch {
      return Response.json(
        { error: "Invalid metadata parameter: not valid JSON." },
        { status: 400 },
      );
    }
  }

  const offerId =
    parseOfferId(url.searchParams.get("offerId")) ||
    (metadata && typeof metadata.offerId === "string"
      ? parseOfferId(String(metadata.offerId))
      : null);
  const interval =
    parseInterval(url.searchParams.get("interval")) ||
    (metadata && typeof metadata.interval === "string"
      ? parseInterval(String(metadata.interval))
      : null);

  if ((offerId && !interval) || (!offerId && interval)) {
    return Response.json(
      {
        error:
          "offerId and interval must be provided together (or included in metadata).",
      },
      { status: 400 },
    );
  }

  let products: string[] = [];
  if (offerId && interval) {
    const id = polarProductId(env, offerId, interval);
    if (!id) {
      return Response.json(
        {
          error: `Missing environment mapping for ${offerId}/${interval}.`,
        },
        { status: 500 },
      );
    }
    products = [id];
  } else {
    const raw = url.searchParams.getAll("products");
    const joined = url.searchParams.get("products");
    if (raw.length > 1) products = raw;
    else if (joined) products = joined.split(",").map((p) => p.trim()).filter(Boolean);
  }

  if (products.length === 0) {
    return Response.json(
      {
        error:
          "Missing products parameter. Provide products or valid offerId + interval.",
      },
      { status: 400 },
    );
  }
  if (products.some((id) => !UUID_RE.test(id))) {
    return Response.json(
      {
        error:
          'Invalid products parameter. Expected Polar product UUID(s).',
      },
      { status: 400 },
    );
  }

  const customerEmail = str(url.searchParams.get("customerEmail")).toLowerCase();
  if (url.searchParams.has("customerEmail") && !customerEmail) {
    return Response.json(
      { error: "Invalid customerEmail parameter. Expected a non-empty value." },
      { status: 400 },
    );
  }
  if (customerEmail && !EMAIL_RE.test(customerEmail)) {
    return Response.json(
      {
        error: "Invalid customerEmail parameter. Expected a valid email address.",
      },
      { status: 400 },
    );
  }

  const customerName = str(url.searchParams.get("customerName"));
  if (url.searchParams.has("customerName") && !customerName) {
    return Response.json(
      { error: "Invalid customerName parameter. Expected a non-empty value." },
      { status: 400 },
    );
  }

  const polarHost =
    serverRaw === "production"
      ? "https://api.polar.sh"
      : "https://sandbox-api.polar.sh";

  try {
    const upstream = await fetch(`${polarHost}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products,
        success_url: successUrl,
        return_url: returnUrl,
        customer_email: customerEmail || undefined,
        customer_name: customerName || undefined,
        metadata,
      }),
    });

    const text = await upstream.text();
    let data: { url?: string; detail?: unknown; error?: string } | null = null;
    try {
      data = text ? (JSON.parse(text) as { url?: string }) : null;
    } catch {
      data = null;
    }

    if (!upstream.ok || !data?.url) {
      return Response.json(
        {
          error: "Failed to create Polar checkout session.",
          details: data?.detail ?? data?.error ?? text.slice(0, 300),
        },
        { status: upstream.status || 500 },
      );
    }

    const redirectUrl = new URL(data.url);
    redirectUrl.searchParams.set("theme", "light");
    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    return Response.json(
      {
        error: "Failed to create Polar checkout session.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

type PolarCheckout = {
  status?: string;
  product_id?: string;
  customer_email?: string | null;
  metadata?: Record<string, unknown> | null;
};

const OFFER_IDS = ["lite", "standard", "pro"] as const;
const INTERVALS = ["month", "year"] as const;

function offerForProduct(env: WorkerEnv, productId: string) {
  for (const offerId of OFFER_IDS) {
    for (const interval of INTERVALS) {
      if (productId && polarProductId(env, offerId, interval) === productId) {
        return { offerId, interval };
      }
    }
  }
  return null;
}

async function sendOnboarding(
  method: "PUT" | "POST",
  url: string,
  authorization: string,
  body: unknown,
): Promise<number> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: JSON.stringify(body),
    });
    return response.status;
  } catch {
    return 0;
  }
}

/**
 * Confirms a Polar checkout server-side, then activates the buyer and records
 * the payment.
 *
 * The browser sends only the checkout id and its own login token. Status, plan,
 * email and account id are all read back from Polar, so none can be forged; the
 * account id is the one bound into the checkout when it was created. Activation
 * uses the onboarding service's existing individual-plan endpoints, with the
 * buyer's token, since every backend route requires one. The payment record
 * (`POST /users/{id}/payments`) carries only the checkout id: the backend looks
 * the payment up in Polar with its own token, so it trusts nothing we send.
 */
export async function handlePolarPayment(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ status: "error", message: "Method not allowed" }, { status: 405 });
  }
  const checkoutId = decodeURIComponent(new URL(request.url).pathname.split("/").pop() ?? "");
  if (!UUID_RE.test(checkoutId)) {
    return Response.json({ status: "invalid", message: "Invalid checkout id." }, { status: 400 });
  }

  const accessToken = str(env.POLAR_ACCESS_TOKEN);
  if (!accessToken) {
    return Response.json(
      { status: "error", message: "Payment verification is not configured." },
      { status: 500 },
    );
  }
  const polarHost =
    str(env.POLAR_SERVER) === "production" ? "https://api.polar.sh" : "https://sandbox-api.polar.sh";

  let checkout: PolarCheckout;
  try {
    const response = await fetch(`${polarHost}/v1/checkouts/${checkoutId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    if (response.status === 404) {
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    if (!response.ok) {
      return Response.json({ status: "unavailable" }, { status: 502 });
    }
    checkout = (await response.json()) as PolarCheckout;
  } catch {
    return Response.json({ status: "unavailable" }, { status: 502 });
  }

  const offer = offerForProduct(env, str(checkout.product_id));
  if (!offer) {
    return Response.json({ status: "not_found" }, { status: 404 });
  }

  // "confirmed" means the charge is still settling; only "succeeded" grants access.
  const polarStatus = str(checkout.status).toLowerCase();
  if (polarStatus === "confirmed") {
    return Response.json({ status: "processing" }, { status: 202 });
  }
  if (polarStatus !== "succeeded") {
    return Response.json({ status: "unpaid", polar_status: polarStatus || null }, { status: 402 });
  }

  const tier = findOffer(offer.offerId)?.name ?? offer.offerId;
  const userId = str(checkout.metadata?.userId);
  const authorization = str(request.headers.get("Authorization"));

  const failureFor = (code: number) =>
    code === 401 || code === 403 ? "session_rejected" : "backend_error";

  let recorded = false;
  let recordStatus: string | null = null;
  let paymentRecorded = false;
  let paymentRecordStatus: string | null = null;
  if (!userId) {
    recordStatus = "no_account";
    paymentRecordStatus = "no_account";
  } else if (!authorization) {
    recordStatus = "no_session";
    paymentRecordStatus = "no_session";
  } else {
    const activate = async () => {
      // Same two calls, in the same order, that provisionAccount has always made.
      const saved = await sendOnboarding("PUT", userSubscriptionUrl(env, userId), authorization, {
        subscriptions: [
          { plan_id: SUBSCRIPTION_PLAN_ID, subplan_name: tier, billing_cycle: offer.interval },
        ],
      });
      return saved >= 200 && saved < 300
        ? sendOnboarding("PUT", userPaymentStatusUrl(env, userId), authorization, {
            payment_status: true,
          })
        : saved;
    };
    // The payment record is independent of activation, so the two run side by
    // side and a failure in one never blocks the other.
    const [paid, logged] = await Promise.all([
      activate(),
      sendOnboarding("POST", userPaymentsUrl(env, userId), authorization, {
        checkout_id: checkoutId,
      }),
    ]);
    recorded = paid >= 200 && paid < 300;
    if (!recorded) recordStatus = failureFor(paid);
    paymentRecorded = logged >= 200 && logged < 300;
    if (!paymentRecorded) paymentRecordStatus = failureFor(logged);
  }

  return Response.json({
    status: "paid",
    checkout_id: checkoutId,
    offer_id: offer.offerId,
    purchase: {
      email: str(checkout.customer_email),
      plan: PLAN_NAME,
      tier,
      interval: offer.interval,
    },
    recorded,
    record_status: recordStatus,
    payment_recorded: paymentRecorded,
    payment_record_status: paymentRecordStatus,
  });
}

/** Dispatch same-origin API routes. Returns null if the path is not an API route. */
export function matchApiRoute(
  pathname: string,
):
  | "community-request"
  | "auth-login"
  | "auth-register"
  | "auth-verify-otp"
  | "auth-resend"
  | "auth-join"
  | "plans"
  | "checkout"
  | "polar-payment"
  | null {
  if (pathname === "/api/communities/request") return "community-request";
  if (pathname === "/api/auth/login") return "auth-login";
  if (pathname === "/api/auth/register") return "auth-register";
  if (pathname === "/api/auth/verify-otp") return "auth-verify-otp";
  if (pathname === "/api/auth/resend-verification") return "auth-resend";
  if (pathname === "/api/auth/join-community-by-code") return "auth-join";
  if (pathname === "/api/plans") return "plans";
  if (pathname === "/checkout") return "checkout";
  if (pathname.startsWith("/api/polar/payment/")) return "polar-payment";
  return null;
}

export async function handleApiRoute(
  route: NonNullable<ReturnType<typeof matchApiRoute>>,
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  switch (route) {
    case "community-request":
      return handleCommunityRequest(request, env);
    case "auth-login":
      return handleAuthLogin(request, env);
    case "auth-register":
      return handleAuthRegister(request, env);
    case "auth-verify-otp":
      return handleAuthVerifyOtp(request, env);
    case "auth-resend":
      return handleAuthResend(request, env);
    case "auth-join":
      return handleJoinCommunity(request, env);
    case "plans":
      return handlePlans(request, env);
    case "checkout":
      return handleCheckout(request, env);
    case "polar-payment":
      return handlePolarPayment(request, env);
  }
}
