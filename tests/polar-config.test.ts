/**
 * Polar sandbox -> production safety.
 *
 * Covers the two ways the migration could fail silently: a sandbox product id
 * reaching the live API, and an unset environment resolving to sandbox. Both
 * used to be the default behaviour.
 */
import { describe, expect, it } from "vitest";
import {
  polarProductIdFor as serverProductId,
  resolvePolarServer as serverResolve,
} from "../server/funnel/lib/config";
import {
  configuredProductIds,
  resolvePolarServer as workerResolve,
} from "../worker/api-proxy";
import type { WorkerEnv } from "../worker/upstream";

const SANDBOX_LITE_MONTH = "ed645dbc-b203-4918-a8d1-9ae31dc068df";
const PROD_LITE_MONTH = "83e71254-95df-48f3-a8d3-f02ecd5b51a4";

const env = (over: Partial<Record<string, string>> = {}) =>
  ({
    POLAR_PRODUCT_LITE_MONTH: PROD_LITE_MONTH,
    POLAR_PRODUCT_LITE_YEAR: "09442f06-a270-4a89-a5c7-deebd3b471a1",
    POLAR_PRODUCT_STANDARD_MONTH: "a93c997a-c621-4d53-9870-4d021b52625a",
    POLAR_PRODUCT_STANDARD_YEAR: "ce263ca8-53c6-41ee-8873-23dd820de99a",
    POLAR_PRODUCT_PRO_MONTH: "33816df6-ad51-4471-99e0-222474b9bc5b",
    POLAR_PRODUCT_PRO_YEAR: "79e6bb1f-33a2-4f72-9a46-face47b66659",
    ...over,
  }) as unknown as WorkerEnv;

describe("environment selection fails safely", () => {
  for (const resolve of [workerResolve, serverResolve]) {
    it("rejects an unset POLAR_SERVER rather than assuming sandbox", () => {
      const r = resolve(undefined as never);
      expect("error" in r && r.error).toMatch(/not set/i);
    });
    it("rejects an invalid POLAR_SERVER", () => {
      const r = resolve("prod" as never);
      expect("error" in r && r.error).toMatch(/Allowed values/i);
    });
    it("accepts the two valid values", () => {
      expect(resolve("sandbox" as never)).toEqual({ server: "sandbox" });
      expect(resolve("production" as never)).toEqual({ server: "production" });
    });
  }
});

describe("production never resolves a sandbox fallback", () => {
  it("returns undefined when a production id is missing", () => {
    expect(serverProductId("lite", "month", "production")).toBeUndefined();
  });

  it("still serves the sandbox fallback in sandbox", () => {
    expect(serverProductId("lite", "month", "sandbox")).toBe(SANDBOX_LITE_MONTH);
  });

  it("uses the configured id when one is present", () => {
    process.env.POLAR_PRODUCT_LITE_MONTH = PROD_LITE_MONTH;
    expect(serverProductId("lite", "month", "production")).toBe(PROD_LITE_MONTH);
    delete process.env.POLAR_PRODUCT_LITE_MONTH;
  });

  it("omits a missing mapping from the worker's allow-list in production", () => {
    const partial = env({ POLAR_PRODUCT_PRO_YEAR: "" });
    const ids = configuredProductIds(partial, "production");
    expect(ids.size).toBe(5);
    expect(ids.has("79e6bb1f-33a2-4f72-9a46-face47b66659")).toBe(false);
  });
});

describe("the worker only sells its own products", () => {
  it("allow-lists exactly the six configured ids", () => {
    const ids = configuredProductIds(env(), "production");
    expect(ids.size).toBe(6);
    expect(ids.has(PROD_LITE_MONTH)).toBe(true);
  });

  it("excludes a well-formed but foreign product id", () => {
    const ids = configuredProductIds(env(), "production");
    expect(ids.has("11111111-2222-3333-4444-555555555555")).toBe(false);
  });

  it("excludes the old sandbox ids in production", () => {
    const ids = configuredProductIds(env(), "production");
    expect(ids.has(SANDBOX_LITE_MONTH)).toBe(false);
  });
});

describe("webhook signature verification", () => {
  it("rejects an invalid signature", async () => {
    const { validateEvent } = await import("@polar-sh/sdk/webhooks");
    expect(() =>
      validateEvent(Buffer.from('{"type":"order.paid"}'), { "webhook-signature": "v1,bogus" }, "secret"),
    ).toThrow();
  });

  it("rejects a body with no signature headers at all", async () => {
    const { validateEvent } = await import("@polar-sh/sdk/webhooks");
    expect(() => validateEvent(Buffer.from("{}"), {}, "secret")).toThrow();
  });
});

describe("worker, server and client resolve identically", () => {
  it("client withholds the sandbox fallback in production, like the server", async () => {
    const client = await import("../client/src/funnel/lib/config");
    expect(client.polarProductIdFor("lite", "month", "production")).toBeUndefined();
    expect(serverProductId("lite", "month", "production")).toBeUndefined();
  });

  it("client serves the same sandbox fallback as the server in sandbox", async () => {
    const client = await import("../client/src/funnel/lib/config");
    expect(client.polarProductIdFor("lite", "month", "sandbox")).toBe(SANDBOX_LITE_MONTH);
    expect(serverProductId("lite", "month", "sandbox")).toBe(SANDBOX_LITE_MONTH);
  });

  it("all three agree on every offer/interval pair in sandbox", async () => {
    const client = await import("../client/src/funnel/lib/config");
    for (const offer of ["lite", "standard", "pro"] as const) {
      for (const interval of ["month", "year"] as const) {
        expect(client.polarProductIdFor(offer, interval, "sandbox")).toBe(
          serverProductId(offer, interval, "sandbox"),
        );
      }
    }
  });

  it("an unset VITE_POLAR_SERVER is treated as production by the client", async () => {
    const client = await import("../client/src/funnel/lib/config");
    expect(client.clientPolarServer()).toBe("production");
    expect(client.polarProductIdFor("pro", "year")).toBeUndefined();
  });
});
