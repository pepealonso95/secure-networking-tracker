import { describe, expect, it } from "vitest";

import { apiError, parseBearerToken } from "./http.js";

describe("HTTP helpers", () => {
  it.each([undefined, "", "Basic abc", "Bearer", "Bearer one two"])(
    "rejects a missing or malformed bearer header: %s",
    (header) => {
      expect(parseBearerToken(header)).toBeNull();
    },
  );

  it("parses a bearer token without changing it", () => {
    expect(parseBearerToken("Bearer header.payload.signature")).toBe("header.payload.signature");
  });

  it("creates the stable API error contract", () => {
    expect(apiError("validation_error", "Check the form", { name: ["Name is required"] })).toEqual({
      error: {
        code: "validation_error",
        message: "Check the form",
        fieldErrors: { name: ["Name is required"] },
      },
    });
  });
});
