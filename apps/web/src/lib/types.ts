export const priorities = ["high", "medium", "low"] as const;
export type Priority = (typeof priorities)[number];

export interface Contact {
  id: number;
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
}

export interface ContactInput {
  name: string;
  company: string | null;
  role: string | null;
  where_met: string | null;
  notes: string | null;
  priority: Priority;
}

export type PriorityFilter = "all" | Priority;
export type ContactSort = "recent" | "name" | "priority";

