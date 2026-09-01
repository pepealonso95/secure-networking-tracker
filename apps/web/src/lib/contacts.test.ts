import { describe, expect, it } from "vitest";

import { contactFormSchema, filterAndSortContacts, prepareContactPayload } from "./contacts";
import type { Contact } from "./types";

const contacts: Contact[] = [
  {
    id: 1,
    name: "Grace Hopper",
    company: "US Navy",
    role: "Rear admiral",
    where_met: "Compiler conference",
    notes: "Follow up about COBOL",
    priority: "high",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    company: null,
    role: "Mathematician",
    where_met: "Analytical engine salon",
    notes: null,
    priority: "low",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-03T00:00:00Z",
  },
];

describe("contact collection presentation", () => {
  it("searches every requested field", () => {
    expect(filterAndSortContacts(contacts, "cobol", "all", "recent").map((c) => c.id)).toEqual([1]);
    expect(filterAndSortContacts(contacts, "salon", "all", "recent").map((c) => c.id)).toEqual([2]);
  });

  it("filters by priority", () => {
    expect(filterAndSortContacts(contacts, "", "high", "recent").map((c) => c.id)).toEqual([1]);
  });

  it("supports recent, name, and priority sorting", () => {
    expect(filterAndSortContacts(contacts, "", "all", "recent").map((c) => c.id)).toEqual([2, 1]);
    expect(filterAndSortContacts(contacts, "", "all", "name").map((c) => c.id)).toEqual([2, 1]);
    expect(filterAndSortContacts(contacts, "", "all", "priority").map((c) => c.id)).toEqual([1, 2]);
  });

  it("validates and normalizes a form payload", () => {
    const values = contactFormSchema.parse({
      name: " Ada ", company: " ", role: " Mathematician ", where_met: "", notes: "", priority: "medium",
    });
    expect(prepareContactPayload(values)).toEqual({
      name: "Ada", company: null, role: "Mathematician", where_met: null, notes: null, priority: "medium",
    });
  });
});

