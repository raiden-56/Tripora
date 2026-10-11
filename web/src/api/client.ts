/** Thin fetch wrapper: base URL, auth header injection, and consistent error shape. */

import { refresh as authRefresh, type TokenResponse } from "./auth.api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const REQUEST_TIMEOUT_MS = 30_000;

/** Turns a backend-relative media path ("/uploads/...") into a full URL. */
export function mediaUrl(url: string): string;
export function mediaUrl(url: string | null | undefined): string | null;
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

let accessToken: string | null = null;
export function setAccessToken(token: string | null) {
  accessToken = token;
}

interface AuthHandlers {
  getRefreshToken: () => string | null;
  onTokenRefreshed: (tokens: TokenResponse) => void;
  onAuthExpired: () => void;
}

let authHandlers: AuthHandlers | null = null;
export function registerAuthHandlers(handlers: AuthHandlers) {
  authHandlers = handlers;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Refreshes the access token at most once concurrently (the backend rotates and
 * revokes the refresh token on use, so parallel refresh calls would race). */
async function tryRefreshToken(): Promise<boolean> {
  if (!authHandlers) return false;
  const refreshToken = authHandlers.getRefreshToken();
  if (!refreshToken) {
    authHandlers.onAuthExpired();
    return false;
  }
  if (!refreshInFlight) {
    refreshInFlight = authRefresh(refreshToken)
      .then((tokens) => {
        setAccessToken(tokens.access_token);
        authHandlers?.onTokenRefreshed(tokens);
        return true;
      })
      .catch(() => {
        authHandlers?.onAuthExpired();
        return false;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, isFormData = false } = options;

  const doFetch = async () => {
    const headers: Record<string, string> = {};
    // Only bodies need a Content-Type; leaving it off GETs avoids a CORS preflight.
    if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
    if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        signal: controller.signal,
        body:
          body === undefined
            ? undefined
            : isFormData
              ? (body as FormData)
              : JSON.stringify(body),
      });
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "AbortError";
      throw new ApiError(
        timedOut
          ? "The server took too long to respond. Please try again."
          : "Can't reach Travel Diaries right now. Check your connection and try again.",
        timedOut ? "TIMEOUT" : "NETWORK_ERROR",
        0,
      );
    } finally {
      clearTimeout(timer);
    }
  };

  let response = await doFetch();

  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) response = await doFetch();
  }

  if (response.status === 204) return undefined as T;

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorBody = data as {
      error?: { code?: string; message?: string };
    } | null;
    throw new ApiError(
      errorBody?.error?.message ?? "Something went wrong. Please try again.",
      errorBody?.error?.code ?? "UNKNOWN_ERROR",
      response.status,
    );
  }

  return data as T;
}

/** Builds a JSON body from only the keys present in `source`, renaming them via
 * `fields` and sending `null` for keys that are present but empty — so an edit can
 * clear an optional field, while untouched fields are left out entirely. */
export function pickBody<S extends object>(
  source: S,
  fields: Partial<Record<keyof S, string>>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, backendKey] of Object.entries(fields) as [keyof S, string][]) {
    if (!(key in source)) continue;
    const value = source[key];
    body[backendKey] = value === undefined || value === "" ? null : value;
  }
  return body;
}
