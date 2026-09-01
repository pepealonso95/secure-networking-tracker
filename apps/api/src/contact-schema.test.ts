import { describe, expect, it } from "vitest";

import { createContactSchema, updateContactSchema } from "./contact-schema.js";

describe("contact input validation", () => {
  it("trims fields, converts empty optional values to null, and strips ownership", () => {
    const result = createContactSchema.parse({
      name: "  Ada Lovelace  ",
      company: "  ",
      role: "  Mathematician ",
      priority: "high",
      user_id: "attacker-controlled",
    });

    expect(result).toEqual({
      name: "Ada Lovelace",
      company: null,
      role: "Mathematician",
      priority: "high",
    });
    expect(result).not.toHaveProperty("user_id");
  });

  it.each([
    [{ name: " " }, "Name is required"],
    [{ name: "x".repeat(101) }, "Name must be 100 characters or fewer"],
    [{ name: "Grace", priority: "urgent" }, "Invalid option"],
    [{ name: "Grace", notes: "x".repeat(2001) }, "Notes must be 2,000 characters or fewer"],
  ])("rejects invalid create input %#", (input, message) => {
    const result = createContactSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message).join(" ")).toContain(message);
    }
  });

  it("requires a meaningful update and strips ownership fields", () => {
    expect(updateContactSchema.safeParse({ user_id: "someone-else" }).success).toBe(false);

    const result = updateContactSchema.parse({
      company: "  Analytical Engines Ltd. ",
      user_id: "someone-else",
      created_at: "yesterday",
    });

    expect(result).toEqual({ company: "Analytical Engines Ltd." });
  });
});
