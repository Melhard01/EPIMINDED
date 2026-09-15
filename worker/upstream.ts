/**
 * Production upstream bases for the Cloudflare Worker.
 *
 * Same pattern as the Community Creation Next.js app (`UPSTREAM_AUTH_BASE` in
 * lib/api/upstream.ts) and the Express BFF defaults in server/funnel/routes.ts:
 * hardcode the public gateway here so Production does not depend on gitignored
 * .env files. Optional Worker env overrides (dashboard / keep_vars) still win.
 */

export const DEFAULT_AUTH_BASE = "https://backend.soulchain.net/auth";
export const DEFAULT_COMMUNITIES_BASE =
  "https://backend.soulchain.net/communities";
export const DEFAULT_ONBOARDING_BASE =
  "https://backend.soulchain.net/onboarding";
export const DEFAULT_COMMUNITY_LEAD_URL = `${DEFAULT_COMMUNITIES_BASE}/communities/request/lead`;

export type WorkerEnv = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  COMMUNITY_UPSTREAM_URL?: string;
  AUTH_API_BASE_URL?: string;
  AUTH_LOGIN_URL?: string;
  AUTH_REGISTER_URL?: string;
  AUTH_VERIFY_OTP_URL?: string;
  AUTH_RESEND_VERIFICATION_URL?: string;
  AUTH_JOIN_COMMUNITY_BY_CODE_URL?: string;
  COMMUNITIES_REQUEST_URL?: string;
  SUBSCRIPTION_API_BASE_URL?: string;
  PLANS_WEB_URL?: string;
  POLAR_ACCESS_TOKEN?: string;
  POLAR_SERVER?: string;
  POLAR_PRODUCT_LITE_MONTH?: string;
  POLAR_PRODUCT_LITE_YEAR?: string;
  POLAR_PRODUCT_STANDARD_MONTH?: string;
  POLAR_PRODUCT_STANDARD_YEAR?: string;
  POLAR_PRODUCT_PRO_MONTH?: string;
  POLAR_PRODUCT_PRO_YEAR?: string;
  SUCCESS_URL?: string;
  VITE_APP_URL?: string;
  VITE_SITE_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

function trimEnv(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v || undefined;
}

export function authBase(env: WorkerEnv): string {
  return trimEnv(env.AUTH_API_BASE_URL) || DEFAULT_AUTH_BASE;
}

export function authLoginUrl(env: WorkerEnv): string {
  return trimEnv(env.AUTH_LOGIN_URL) || `${authBase(env)}/api/auth/login`;
}

export function authRegisterUrl(env: WorkerEnv): string {
  return trimEnv(env.AUTH_REGISTER_URL) || `${authBase(env)}/api/auth/register`;
}

export function authVerifyEmailUrl(env: WorkerEnv): string {
  return (
    trimEnv(env.AUTH_VERIFY_OTP_URL) || `${authBase(env)}/api/auth/verify-email`
  );
}

export function authVerifyOtpLegacyUrl(env: WorkerEnv): string {
  return `${authBase(env)}/api/auth/verify-otp`;
}

export function authResendUrl(env: WorkerEnv): string {
  return (
    trimEnv(env.AUTH_RESEND_VERIFICATION_URL) ||
    `${authBase(env)}/api/auth/resend-verification`
  );
}

export function joinCommunityUrl(env: WorkerEnv): string {
  return (
    trimEnv(env.AUTH_JOIN_COMMUNITY_BY_CODE_URL) ||
    `${DEFAULT_COMMUNITIES_BASE}/join-community-by-code`
  );
}

export function communityLeadUrl(env: WorkerEnv): string {
  return (
    trimEnv(env.COMMUNITY_UPSTREAM_URL) ||
    trimEnv(env.COMMUNITIES_REQUEST_URL) ||
    DEFAULT_COMMUNITY_LEAD_URL
  );
}

function onboardingBase(env: WorkerEnv): string {
  return trimEnv(env.SUBSCRIPTION_API_BASE_URL) || DEFAULT_ONBOARDING_BASE;
}

export function plansWebUrl(env: WorkerEnv): string {
  return trimEnv(env.PLANS_WEB_URL) || `${onboardingBase(env)}/plans/web`;
}

export function userSubscriptionUrl(env: WorkerEnv, userId: string): string {
  return `${onboardingBase(env)}/users/${encodeURIComponent(userId)}/subscription`;
}

export function userPaymentStatusUrl(env: WorkerEnv, userId: string): string {
  return `${onboardingBase(env)}/users/payment-status/${encodeURIComponent(userId)}`;
}

export async function proxyUpstreamJson(
  upstream: Response,
): Promise<Response> {
  const contentType = upstream.headers.get("content-type") || "";
  const text = await upstream.text();

  if (contentType.includes("application/json")) {
    try {
      const data = text ? JSON.parse(text) : null;
      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        typeof (data as { detail?: unknown }).detail === "string" &&
        !(data as { message?: unknown }).message
      ) {
        return Response.json(
          {
            ...(data as Record<string, unknown>),
            message: (data as { detail: string }).detail,
          },
          { status: upstream.status },
        );
      }
      return Response.json(data ?? {}, { status: upstream.status });
    } catch {
      return Response.json({ message: text }, { status: upstream.status });
    }
  }

  if (!text.trim().startsWith("{")) {
    return Response.json(
      {
        code: "UPSTREAM_UNAVAILABLE",
        message: "Upstream service is temporarily unavailable.",
      },
      { status: 502 },
    );
  }

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
