import { describe, expect, it } from "vitest";

import { createApp } from "./app.js";

describe("API contract", () => {
  it("returns a public health response", async () => {
    const response = await createApp().request("/api/health");
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { status: "ok", service: "secure-networking-tracker-api" },
    });
  });

  it.each([
    ["GET", "/api/contacts"],
    ["POST", "/api/contacts"],
    ["PATCH", "/api/contacts/1"],
    ["DELETE", "/api/contacts/1"],
  ])("rejects an unauthenticated %s %s request", async (method, path) => {
    const response = await createApp().request(path, { method });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: "unauthorized", message: "A valid bearer token is required" },
    });
  });

  it("does not reflect an untrusted CORS origin", async () => {
    const response = await createApp().request("/api/health", {
      headers: { Origin: "https://attacker.example" },
    });
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});
