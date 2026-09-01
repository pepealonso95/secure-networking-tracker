export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "not_found"
  | "validation_error"
  | "internal_error";

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
}

export function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+([^\s]+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(fieldErrors ? { fieldErrors } : {}),
    },
  };
}

