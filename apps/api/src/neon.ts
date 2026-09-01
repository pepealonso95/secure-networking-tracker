import { createClient } from "@neondatabase/neon-js";

import type { Database } from "./types";

export function createDataClient(token: string) {
  const url = process.env.NEON_DATA_API_URL;
  if (!url) {
    throw new Error("NEON_DATA_API_URL is not configured");
  }

  return createClient<Database>({
    dataApi: {
      url,
      getToken: async () => token,
    },
  });
}

export type DataClient = ReturnType<typeof createDataClient>;

