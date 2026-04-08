import type { ValidationIssue } from "@forum-reddit/shared-types";

type PrimitiveQueryValue = string | number | boolean;
type QueryParamValue = PrimitiveQueryValue | null | undefined;

export type QueryParams = Record<string, QueryParamValue>;

export type RequestOptions = {
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export type HttpClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T>;
  post<T>(path: string, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T>;
};

type ErrorPayload = {
  message?: string;
  code?: string;
  errors?: ValidationIssue[];
};

type CreateHttpClientConfig = {
  baseUrl: string;
  getAuthHeaders?: () => Record<string, string>;
};

const DEFAULT_ERROR_MESSAGE = "Unexpected server error.";
const DEFAULT_NETWORK_MESSAGE = "Network request failed.";

export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: ValidationIssue[];

  constructor(params: {
    status: number;
    code: string;
    message: string;
    fieldErrors?: ValidationIssue[];
  }) {
    super(params.message);
    this.name = "AppApiError";
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors ?? [];
  }
}

function buildRequestUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const absoluteUrl = new URL(`${baseUrl}${normalizedPath}`, window.location.origin);

  if (!query) {
    return absoluteUrl.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    absoluteUrl.searchParams.set(key, String(value));
  }

  return absoluteUrl.toString();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function toApiError(response: Response, payload: unknown): AppApiError {
  const errorPayload =
    typeof payload === "object" && payload !== null ? (payload as ErrorPayload) : undefined;

  return new AppApiError({
    status: response.status,
    code: errorPayload?.code ?? "INTERNAL_SERVER_ERROR",
    message: errorPayload?.message ?? DEFAULT_ERROR_MESSAGE,
    fieldErrors: Array.isArray(errorPayload?.errors) ? errorPayload.errors : [],
  });
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function createHttpClient(config: CreateHttpClientConfig): HttpClient {
  async function request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = buildRequestUrl(config.baseUrl, path, options.query);
    const authHeaders = config.getAuthHeaders?.() ?? {};
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...authHeaders,
      ...options.headers,
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        method,
        signal: options.signal,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      });
      const payload = await parseResponseBody(response);

      if (!response.ok) {
        throw toApiError(response, payload);
      }

      return payload as T;
    } catch (error) {
      if (error instanceof AppApiError || isAbortError(error)) {
        throw error;
      }

      throw new AppApiError({
        status: 0,
        code: "NETWORK_ERROR",
        message: DEFAULT_NETWORK_MESSAGE,
      });
    }
  }

  return {
    get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
      request<T>("GET", path, options),
    post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
    patch: <T>(path: string, options?: RequestOptions) => request<T>("PATCH", path, options),
    delete: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
      request<T>("DELETE", path, options),
  };
}