import { createClient } from "@neondatabase/neon-js";
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react/adapters";

const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;
const dataApiUrl = process.env.NEXT_PUBLIC_NEON_DATA_API_URL;

if (!authUrl || !dataApiUrl) {
  throw new Error("Neon public URLs are not configured");
}

export const neon = createClient({
  auth: {
    url: authUrl,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: {
    url: dataApiUrl,
  },
});

export type SessionData = {
  session: { token?: string };
  user: { id: string; name: string; email: string };
};

export function sessionToken(data: unknown): string | null {
  const token = (data as SessionData | null)?.session?.token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

