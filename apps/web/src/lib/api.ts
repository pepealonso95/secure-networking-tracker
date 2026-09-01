const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export type FieldErrors = Record<string, string[]>;

export class ApiFailure extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiFailure";
  }
}

interface ErrorEnvelope {
  error?: {
    code?: string;
    message?: string;
    fieldErrors?: FieldErrors;
  };
}

export async function apiRequest<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ErrorEnvelope & { data?: T };
  if (!response.ok) {
    throw new ApiFailure(
      payload.error?.message ?? "The request could not be completed",
      response.status,
      payload.error?.code ?? "unknown_error",
      payload.error?.fieldErrors,
    );
  }

  return payload.data as T;
}

