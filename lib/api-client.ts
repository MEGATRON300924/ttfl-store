const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  cache?: RequestCache;

  /*
   * Prevent the refresh request itself from recursively
   * attempting another refresh.
   */
  skipRefresh?: boolean;
};

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  /*
   * If multiple API requests fail at the same time, they all
   * share one refresh request instead of creating a refresh race.
   */
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));

          throw new ApiError(
            res.status,
            json?.error?.message ?? "Session expired",
            json?.error?.code
          );
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function request<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    credentials: "include",
    cache: opts.cache ?? "no-store",
    headers: opts.body
      ? {
          "Content-Type": "application/json",
        }
      : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json().catch(() => ({}));

  /*
   * Access token expired.
   *
   * Try the long-lived refresh session once, then retry
   * the original request.
   */
  if (
    res.status === 401 &&
    !opts.skipRefresh &&
    path !== "/api/auth/refresh" &&
    path !== "/api/auth/login" &&
    path !== "/api/auth/logout"
  ) {
    try {
      await refreshSession();

      return request<T>(path, {
        ...opts,
        skipRefresh: true,
      });
    } catch {
      /*
       * Refresh token is also invalid/expired.
       * Fall through and return the original 401.
       */
    }
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      json?.error?.message ?? "Something went wrong",
      json?.error?.code
    );
  }

  return json as T;
}

export const api = {
  get: <T>(
    path: string,
    opts?: Omit<RequestOptions, "method" | "body">
  ) => request<T>(path, { ...opts, method: "GET" }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body,
    }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
