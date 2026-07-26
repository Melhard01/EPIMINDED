import { Router, type Request, type Response } from "express";
import { Polar } from "@polar-sh/sdk";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { resolveMx } from "node:dns/promises";
import { resolveWebPlans } from "./lib/plans";
import { provisionAccount } from "./lib/provision";
import { verifyEntitlement } from "./lib/entitlement/token";
import { polarProductIdFor, type BillingInterval } from "./lib/config";

const router = Router();

const DEFAULT_AUTH_BASE_URL = "http://40.89.185.79:4006";
const DEFAULT_JOIN_COMMUNITY_BASE = "http://40.89.185.79:5044";

type PolarServer = "sandbox" | "production";
type PolarMetadataValue = string | number | boolean;
type PolarMetadata = Record<string, PolarMetadataValue>;
type OfferId = "lite" | "standard" | "pro";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRegisterUrl() {
  const explicit = process.env.AUTH_REGISTER_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/register`;
}

function getVerifyOtpUrl() {
  const explicit = process.env.AUTH_VERIFY_OTP_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/verify-email`;
}

function getLegacyVerifyOtpUrl() {
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/verify-otp`;
}

function getResendVerificationUrl() {
  const explicit = process.env.AUTH_RESEND_VERIFICATION_URL?.trim();
  if (explicit) return explicit;
  const base = process.env.AUTH_API_BASE_URL?.trim() || DEFAULT_AUTH_BASE_URL;
  return `${base}/api/auth/resend-verification`;
}

function getJoinCommunityUrl() {
  const explicit = process.env.AUTH_JOIN_COMMUNITY_BY_CODE_URL?.trim();
  if (explicit) return explicit;
  return `${DEFAULT_JOIN_COMMUNITY_BASE}/join-community-by-code`;
}

async function proxyJson(res: Response, upstream: globalThis.Response) {
  const contentType = upstream.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await upstream.json()
    : { message: await upstream.text() };
  return res.status(upstream.status).json(payload);
}

router.get("/api/plans", async (_req, res) => {
  const plans = await resolveWebPlans();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(plans);
});

router.post("/api/provision", async (req, res) => {
  const body = req.body ?? {};
  const email = body?.email ? String(body.email) : undefined;
  const orderRef = body?.orderRef ? String(body.orderRef) : undefined;
  const offerId = body?.offerId ? String(body.offerId) : undefined;
  const interval: BillingInterval = body?.interval === "year" ? "year" : "month";
  const addon = Boolean(body?.addon);
  const userId = body?.userId ? String(body.userId) : undefined;

  if (!email || !orderRef || !offerId) {
    return res
      .status(400)
      .json({ error: "email, orderRef and offerId are required" });
  }

  const result = await provisionAccount(
    email,
    orderRef,
    offerId,
    interval,
    addon,
    userId,
  );
  return res.status(200).json(result);
});

router.get("/api/entitlement/verify", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : null;
  if (!token) {
    return res.status(400).json({ valid: false, error: "Missing token" });
  }
  try {
    const claims = await verifyEntitlement(token);
    return res.status(200).json({ valid: true, claims });
  } catch (err) {
    return res
      .status(401)
      .json({ valid: false, error: (err as Error).message });
  }
});

router.post("/api/auth/register", async (req, res) => {
  const payload = req.body ?? {};
  const firstName = typeof payload.firstName === "string" ? payload.firstName : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      code: "INVALID_PAYLOAD",
      message: "firstName, lastName, email and password are required.",
    });
  }

  try {
    const response = await fetch(getRegisterUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });
    return proxyJson(res, response);
  } catch {
    return res.status(502).json({
      code: "AUTH_SERVICE_UNAVAILABLE",
      message: "Authentication service is temporarily unavailable.",
    });
  }
});

router.post("/api/auth/verify-otp", async (req, res) => {
  const payload = req.body ?? {};
  const email = typeof payload.email === "string" ? payload.email : "";
  const otp = typeof payload.otp === "string" ? payload.otp : "";
  const challengeId =
    typeof payload.challengeId === "string" ? payload.challengeId : undefined;

  if (!email || !otp) {
    return res.status(400).json({
      code: "INVALID_PAYLOAD",
      message: "email and otp are required.",
    });
  }

  try {
    const requestInit: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        verificationCode: otp,
        ...(challengeId ? { challengeId } : {}),
      }),
    };

    let response = await fetch(getVerifyOtpUrl(), requestInit);
    if (response.status === 404 && !process.env.AUTH_VERIFY_OTP_URL?.trim()) {
      response = await fetch(getLegacyVerifyOtpUrl(), {
        ...requestInit,
        body: JSON.stringify({
          email,
          otp,
          ...(challengeId ? { challengeId } : {}),
        }),
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const payloadFromAuth = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    if (
      payloadFromAuth &&
      typeof payloadFromAuth === "object" &&
      !Array.isArray(payloadFromAuth) &&
      typeof (payloadFromAuth as { detail?: unknown }).detail === "string" &&
      !(payloadFromAuth as { message?: unknown }).message
    ) {
      return res.status(response.status).json({
        ...(payloadFromAuth as Record<string, unknown>),
        message: (payloadFromAuth as { detail: string }).detail,
      });
    }

    return res.status(response.status).json(payloadFromAuth);
  } catch {
    return res.status(502).json({
      code: "AUTH_SERVICE_UNAVAILABLE",
      message: "Authentication service is temporarily unavailable.",
    });
  }
});

router.post("/api/auth/resend-verification", async (req, res) => {
  const payload = req.body ?? {};
  const email =
    typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) {
    return res
      .status(400)
      .json({ code: "INVALID_PAYLOAD", message: "email is required." });
  }

  try {
    const response = await fetch(getResendVerificationUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return proxyJson(res, response);
  } catch {
    return res.status(502).json({
      code: "AUTH_SERVICE_UNAVAILABLE",
      message: "Authentication service is temporarily unavailable.",
    });
  }
});

router.post("/api/auth/join-community-by-code", async (req, res) => {
  const payload = req.body ?? {};
  const userId = typeof payload.userId === "string" ? payload.userId.trim() : "";
  const code = typeof payload.code === "string" ? payload.code.trim() : "";

  if (!userId || !code) {
    return res.status(400).json({
      code: "INVALID_PAYLOAD",
      message: "userId and code are required.",
    });
  }

  try {
    const response = await fetch(getJoinCommunityUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, code }),
    });
    return proxyJson(res, response);
  } catch {
    return res.status(502).json({
      code: "AUTH_SERVICE_UNAVAILABLE",
      message: "Community service is temporarily unavailable.",
    });
  }
});

router.post("/api/webhook/polar", async (req, res) => {
  const secret = process.env.POLAR_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return res.status(500).json({ error: "POLAR_WEBHOOK_SECRET is not configured." });
  }

  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: "Missing raw request body for webhook verification." });
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") headers[key] = value;
    else if (Array.isArray(value) && value[0]) headers[key] = value[0];
  }

  let event: Awaited<ReturnType<typeof validateEvent>>;
  try {
    event = validateEvent(rawBody, headers, secret);
  } catch (error) {
    console.error("[Polar Webhook] verification failed", error);
    return res.status(403).json({ error: "Invalid webhook signature." });
  }

  const type = (event as { type?: string }).type;
  const data = (event as { data?: { metadata?: unknown } }).data;

  const getUserIdFromMetadata = (metadata: unknown): string | null => {
    if (!metadata || typeof metadata !== "object") return null;
    const value = (metadata as Record<string, unknown>).userId;
    return typeof value === "string" && value.trim() ? value.trim() : null;
  };

  const paymentStatusUrl = (userId: string) => {
    const base =
      process.env.SUBSCRIPTION_API_BASE_URL?.trim() || "http://40.89.185.79:5029";
    return `${base}/users/payment-status/${encodeURIComponent(userId)}`;
  };

  const syncPaymentStatus = async (userId: string, status: boolean) => {
    try {
      const response = await fetch(paymentStatusUrl(userId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: status }),
      });
      if (!response.ok) {
        console.error("[Polar Webhook] payment-status sync failed", {
          userId,
          status,
          httpStatus: response.status,
          body: await response.text(),
        });
        return;
      }
      console.log("[Polar Webhook] payment-status synced", { userId, status });
    } catch (error) {
      console.error("[Polar Webhook] payment-status request error", { userId, status, error });
    }
  };

  try {
    if (type === "order.paid") {
      const userId = getUserIdFromMetadata(data?.metadata);
      if (!userId) {
        console.error("[Polar Webhook] userId missing in order metadata", { type });
      } else {
        await syncPaymentStatus(userId, true);
      }
    } else if (type === "subscription.active") {
      const userId = getUserIdFromMetadata(data?.metadata);
      if (!userId) {
        console.error("[Polar Webhook] userId missing in subscription metadata", { type });
      } else {
        await syncPaymentStatus(userId, true);
      }
    } else if (type === "subscription.canceled") {
      const userId = getUserIdFromMetadata(data?.metadata);
      if (!userId) {
        console.error("[Polar Webhook] userId missing in subscription metadata", { type });
      } else {
        await syncPaymentStatus(userId, false);
      }
    }
  } catch (error) {
    console.error("[Polar Webhook] handler error", error);
    return res.status(500).json({ error: "Webhook handler failed." });
  }

  return res.status(200).json({ received: true });
});

function parseServer(value: string | undefined): PolarServer | null {
  if (!value) return null;
  if (value === "sandbox" || value === "production") return value;
  return null;
}

function parseMetadata(raw: string | undefined) {
  if (!raw) return undefined;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return { error: "metadata must be a JSON object." as const };
    }
    const entries = Object.entries(parsed as Record<string, unknown>);
    for (const [key, value] of entries) {
      const type = typeof value;
      if (type !== "string" && type !== "number" && type !== "boolean") {
        return {
          error: `metadata.${key} must be string, number, or boolean.`,
        };
      }
    }
    return { value: parsed as PolarMetadata };
  } catch {
    return { error: "metadata must be valid JSON." };
  }
}

function normalizeProducts(query: Request["query"]) {
  const raw = query.products;
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return values
    .flatMap((v) => String(v).split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

function getStatusCode(error: unknown): number {
  if (typeof error !== "object" || error === null) return 500;
  const maybeCode = Number((error as { statusCode?: unknown }).statusCode);
  if (Number.isInteger(maybeCode) && maybeCode >= 100 && maybeCode <= 599) {
    return maybeCode === 0 ? 500 : maybeCode;
  }
  return 500;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unknown Polar checkout error.";
}

function parseOfferId(value: string | null | undefined): OfferId | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "lite" || normalized === "standard" || normalized === "pro") {
    return normalized;
  }
  return null;
}

function parseInterval(value: string | null | undefined): BillingInterval | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "month" || normalized === "year") {
    return normalized;
  }
  return null;
}

function extractEmailDomain(email: string) {
  const atIndex = email.lastIndexOf("@");
  return atIndex === -1 ? "" : email.slice(atIndex + 1).toLowerCase();
}

async function emailDomainHasMx(domain: string) {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    const code =
      typeof error === "object" && error
        ? (error as { code?: string }).code
        : undefined;
    if (
      code === "ENOTFOUND" ||
      code === "ENODATA" ||
      code === "SERVFAIL" ||
      code === "EAI_AGAIN"
    ) {
      return false;
    }
    throw error;
  }
}

router.get("/checkout", async (req, res) => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  const serverRaw = process.env.POLAR_SERVER?.trim();
  const appUrl =
    process.env.VITE_APP_URL?.trim() ||
    process.env.VITE_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  const successUrl =
    process.env.SUCCESS_URL?.trim() ||
    `${appUrl}/success?checkout_id={CHECKOUT_ID}`;
  const returnUrl = `${appUrl}/paywall`;
  const server = parseServer(serverRaw);

  const missing: string[] = [];
  if (!accessToken) missing.push("POLAR_ACCESS_TOKEN");
  if (!serverRaw) missing.push("POLAR_SERVER");

  if (missing.length > 0) {
    return res.status(500).json({
      error: `Missing required environment variables: ${missing.join(", ")}`,
    });
  }

  if (!server) {
    return res.status(500).json({
      error: 'Invalid POLAR_SERVER. Allowed values are "sandbox" or "production".',
    });
  }

  let parsedSuccessUrl: string;
  let parsedReturnUrl: string;
  try {
    parsedSuccessUrl = new URL(successUrl).toString();
    parsedReturnUrl = new URL(returnUrl).toString();
  } catch {
    return res.status(500).json({
      error: "Invalid app/success URL configuration in environment variables.",
    });
  }

  const metadataRaw =
    typeof req.query.metadata === "string" ? req.query.metadata : undefined;
  const metadataResult = parseMetadata(metadataRaw);
  if (metadataResult && "error" in metadataResult) {
    return res.status(400).json({
      error: `Invalid metadata parameter: ${metadataResult.error}`,
    });
  }
  const metadata = metadataResult?.value;

  const metadataOfferId =
    metadata && typeof metadata.offerId === "string"
      ? parseOfferId(metadata.offerId)
      : null;
  const metadataInterval =
    metadata && typeof metadata.interval === "string"
      ? parseInterval(metadata.interval)
      : null;

  const offerIdFromQuery =
    typeof req.query.offerId === "string" ? req.query.offerId : null;
  const intervalFromQuery =
    typeof req.query.interval === "string" ? req.query.interval : null;
  const offerId = parseOfferId(offerIdFromQuery) ?? metadataOfferId;
  const interval = parseInterval(intervalFromQuery) ?? metadataInterval;

  if (offerIdFromQuery && !parseOfferId(offerIdFromQuery)) {
    return res.status(400).json({
      error: 'Invalid offerId parameter. Allowed values: "lite", "standard", "pro".',
    });
  }
  if (intervalFromQuery && !parseInterval(intervalFromQuery)) {
    return res.status(400).json({
      error: 'Invalid interval parameter. Allowed values: "month", "year".',
    });
  }
  if ((offerId && !interval) || (!offerId && interval)) {
    return res.status(400).json({
      error:
        "offerId and interval must be provided together (or included in metadata).",
    });
  }

  const selectedProductId =
    offerId && interval ? polarProductIdFor(offerId, interval) : undefined;
  if (offerId && interval && !selectedProductId) {
    return res.status(500).json({
      error: `Missing environment mapping for ${offerId}/${interval}. Expected POLAR_PRODUCT_${offerId.toUpperCase()}_${interval.toUpperCase()}.`,
    });
  }

  const products = selectedProductId
    ? [selectedProductId]
    : normalizeProducts(req.query);
  if (products.length === 0) {
    return res.status(400).json({
      error:
        "Missing products parameter. Provide products or valid offerId + interval.",
    });
  }

  const invalidProduct = products.find((id) => !UUID_RE.test(id));
  if (invalidProduct) {
    return res.status(400).json({
      error: `Invalid products parameter "${invalidProduct}". Expected Polar product UUID(s).`,
    });
  }

  const customerEmailRaw =
    typeof req.query.customerEmail === "string"
      ? req.query.customerEmail
      : null;
  const customerEmail = customerEmailRaw?.trim().toLowerCase();
  if (customerEmailRaw !== null && !customerEmail) {
    return res.status(400).json({
      error: "Invalid customerEmail parameter. Expected a non-empty value.",
    });
  }
  if (customerEmail && !EMAIL_RE.test(customerEmail)) {
    return res.status(400).json({
      error: "Invalid customerEmail parameter. Expected a valid email address.",
    });
  }
  if (customerEmail) {
    const domain = extractEmailDomain(customerEmail);
    const hasValidDomain = domain ? await emailDomainHasMx(domain) : false;
    if (!hasValidDomain) {
      return res.status(400).json({
        code: "INVALID_EMAIL_DOMAIN",
        message: "This email domain does not exist. Check your email address.",
      });
    }
  }

  const customerNameRaw =
    typeof req.query.customerName === "string" ? req.query.customerName : null;
  const customerName = customerNameRaw?.trim();
  if (customerNameRaw !== null && !customerName) {
    return res.status(400).json({
      error: "Invalid customerName parameter. Expected a non-empty value.",
    });
  }

  const polar = new Polar({
    accessToken: accessToken!,
    server,
  });

  try {
    const checkout = await polar.checkouts.create({
      products,
      successUrl: decodeURI(parsedSuccessUrl),
      returnUrl: decodeURI(parsedReturnUrl),
      customerEmail: customerEmail || undefined,
      customerName: customerName || undefined,
      metadata,
    });

    const redirectUrl = new URL(checkout.url);
    redirectUrl.searchParams.set("theme", "light");
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    const status = getStatusCode(error);
    const message = getErrorMessage(error);
    console.error("[Polar Checkout] create failed", {
      status,
      server,
      message,
      rawError: error,
    });
    return res.status(status || 500).json({
      error: "Failed to create Polar checkout session.",
      details: message,
    });
  }
});

export default router;
