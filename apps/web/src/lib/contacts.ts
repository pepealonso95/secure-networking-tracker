import { z } from "zod";

import type { Contact, ContactSort, PriorityFilter } from "./types";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Use 100 characters or fewer"),
  company: z.string().trim().max(100, "Use 100 characters or fewer"),
  role: z.string().trim().max(100, "Use 100 characters or fewer"),
  where_met: z.string().trim().max(200, "Use 200 characters or fewer"),
  notes: z.string().trim().max(2000, "Use 2,000 characters or fewer"),
  priority: z.enum(["high", "medium", "low"]),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

const priorityRank = { high: 0, medium: 1, low: 2 } as const;

export function prepareContactPayload(values: ContactFormValues) {
  return {
    name: values.name.trim(),
    company: values.company.trim() || null,
    role: values.role.trim() || null,
    where_met: values.where_met.trim() || null,
    notes: values.notes.trim() || null,
    priority: values.priority,
  };
}

export function filterAndSortContacts(
  contacts: Contact[],
  query: string,
  priority: PriorityFilter,
  sort: ContactSort,
): Contact[] {
  const normalized = query.trim().toLocaleLowerCase();

  return contacts
    .filter((contact) => priority === "all" || contact.priority === priority)
    .filter((contact) => {
      if (!normalized) return true;
      return [contact.name, contact.company, contact.role, contact.where_met, contact.notes]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(normalized));
    })
    .toSorted((left, right) => {
      if (sort === "name") return left.name.localeCompare(right.name);
      if (sort === "priority") {
        const priorityDifference = priorityRank[left.priority] - priorityRank[right.priority];
        return priorityDifference || left.name.localeCompare(right.name);
      }
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });
}

