export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/v1${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
      ...(body === undefined
        ? {}
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const fallback =
        response.status === 429
          ? "Too many attempts. Please wait before trying again."
          : response.status >= 500
            ? "The server is unavailable. Please try again."
            : "Unable to complete this request.";
      throw new ApiError(
        response.status,
        response.status < 500 && typeof data?.message === "string"
          ? data.message
          : fallback,
        typeof data?.code === "string" ? data.code : undefined,
      );
    }
    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      "Connection interrupted. The request may have reached the server. Please check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete this request. Please try again.";
}
