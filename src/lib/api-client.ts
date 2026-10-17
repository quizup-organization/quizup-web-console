import type { ApiError } from "@/shared/types/api"

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>
  signal?: AbortSignal
}

export interface ApiClientConfig {
  baseUrl: string
  defaultTimeoutMs?: number
  getAuthToken?: () => string | null
  /** Purge la session locale sur 401 (la garde de route renvoie vers /login). */
  onUnauthorized?: () => Promise<void> | void
  onError?: (error: ApiError) => void
}

/**
 * Client HTTP unique de l'application (fetch, JSON, timeout, Bearer, gestion 401).
 * Aucun autre fichier ne parle HTTP (`best-practices/.frontend/api-integration.md`).
 */
export function createApiClient(config: ApiClientConfig) {
  const timeoutMs = config.defaultTimeoutMs ?? 15_000

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${config.baseUrl}${path}${buildQuery(options.params)}`
    const headers: Record<string, string> = { Accept: "application/json" }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json"
    }
    const token = config.getAuthToken?.()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
    const signal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal

    try {
      let response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      })

      if (response.status === 401 && config.onUnauthorized) {
        await config.onUnauthorized()
        const refreshedToken = config.getAuthToken?.()
        if (refreshedToken) {
          headers.Authorization = `Bearer ${refreshedToken}`
          response = await fetch(url, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal,
          })
        }
      }

      if (!response.ok) {
        const error = await toApiError(response)
        config.onError?.(error)
        throw error
      }

      if (response.status === 204) {
        return undefined as T
      }
      return (await response.json()) as T
    } catch (error) {
      if (isApiError(error)) {
        throw error
      }
      const timedOut = error instanceof DOMException && error.name === "AbortError"
      const apiError: ApiError = {
        message: timedOut
          ? "La console n'a pas répondu dans le délai imparti."
          : "Impossible de contacter la console.",
        statusCode: timedOut ? 408 : 0,
      }
      config.onError?.(apiError)
      throw apiError
    } finally {
      window.clearTimeout(timeout)
    }
  }

  async function requestForm<T>(
    path: string,
    form: FormData,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${config.baseUrl}${path}${buildQuery(options.params)}`
    const headers: Record<string, string> = { Accept: "application/json" }
    const token = config.getAuthToken?.()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(
      () => controller.abort(),
      config.defaultTimeoutMs ?? 15_000,
    )
    const signal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal
    try {
      let response = await fetch(url, {
        method: "POST",
        headers,
        body: form,
        signal,
      })
      if (response.status === 401 && config.onUnauthorized) {
        await config.onUnauthorized()
        const refreshedToken = config.getAuthToken?.()
        if (refreshedToken) {
          headers.Authorization = `Bearer ${refreshedToken}`
          response = await fetch(url, {
            method: "POST",
            headers,
            body: form,
            signal,
          })
        }
      }
      if (!response.ok) {
        const error = await toApiError(response)
        config.onError?.(error)
        throw error
      }
      if (response.status === 204) {
        return undefined as T
      }
      return (await response.json()) as T
    } catch (error) {
      if (isApiError(error)) {
        throw error
      }
      const timedOut = error instanceof DOMException && error.name === "AbortError"
      const apiError: ApiError = {
        message: timedOut
          ? "La console n'a pas répondu dans le délai imparti."
          : "Impossible de contacter la console.",
        statusCode: timedOut ? 408 : 0,
      }
      config.onError?.(apiError)
      throw apiError
    } finally {
      window.clearTimeout(timeout)
    }
  }

  return {
    get: <T>(path: string, options?: RequestOptions) =>
      request<T>("GET", path, undefined, options),
    post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("POST", path, body, options),
    put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
      request<T>("PUT", path, body, options),
    delete: <T>(path: string, options?: RequestOptions) =>
      request<T>("DELETE", path, undefined, options),
    postForm: <T>(path: string, form: FormData, options?: RequestOptions) =>
      requestForm<T>(path, form, options),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

function buildQuery(params?: RequestOptions["params"]): string {
  if (!params) {
    return ""
  }
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value))
    }
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback = `Erreur ${response.status}`
  try {
    const text = await response.text()
    if (!text) {
      return { message: fallback, statusCode: response.status }
    }
    const body = JSON.parse(text) as {
      message?: string
      title?: string
      detail?: string
      type?: string
      error?: string
    }
    return {
      message: body.message ?? body.detail ?? body.title ?? body.error ?? fallback,
      statusCode: response.status,
      title: body.title,
      detail: body.detail,
      type: body.type,
    }
  } catch {
    return { message: fallback, statusCode: response.status }
  }
}

function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    "statusCode" in value
  )
}
