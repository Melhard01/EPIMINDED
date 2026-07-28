const ACCESS_TOKEN_KEYS = [
  "epiminded.auth.accessToken",
  "soulchain.auth.accessToken",
  "access_token",
  "accessToken",
] as const;

function readFromStorage(storage: Storage | undefined): string | null {
  if (!storage) return null;
  for (const key of ACCESS_TOKEN_KEYS) {
    try {
      const value = storage.getItem(key)?.trim();
      if (value) return value;
    } catch {
      /* storage blocked */
    }
  }
  return null;
}

/** Prefer localStorage, then sessionStorage. */
export function getAuthAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return readFromStorage(window.localStorage) || readFromStorage(window.sessionStorage);
}

export function setAuthAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  const value = token?.trim() || "";
  try {
    if (!value) {
      for (const key of ACCESS_TOKEN_KEYS) {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      }
      return;
    }
    window.localStorage.setItem(ACCESS_TOKEN_KEYS[0], value);
    window.sessionStorage.setItem(ACCESS_TOKEN_KEYS[0], value);
  } catch {
    /* storage blocked */
  }
}

/** Pull a JWT from common auth API response shapes. */
export function extractAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  const candidates = [
    record.access_token,
    record.accessToken,
    record.token,
    record.jwt,
    record.id_token,
    record.idToken,
  ];

  const nested =
    record.data && typeof record.data === "object" && !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : null;
  if (nested) {
    candidates.push(
      nested.access_token,
      nested.accessToken,
      nested.token,
      nested.jwt,
    );
  }

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
  return null;
}
