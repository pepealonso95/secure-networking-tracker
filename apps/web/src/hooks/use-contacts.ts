"use client";

import useSWR from "swr";

import { apiRequest } from "@/lib/api";
import type { Contact, ContactInput } from "@/lib/types";

export function useContacts(token: string | null) {
  const result = useSWR(token ? ["/api/contacts", token] : null, ([path, authToken]) =>
    apiRequest<Contact[]>(path, authToken),
  );

  async function createContact(input: ContactInput) {
    if (!token) throw new Error("Not signed in");
    const created = await apiRequest<Contact>("/api/contacts", token, {
      method: "POST",
      body: JSON.stringify(input),
    });
    await result.mutate((current = []) => [created, ...current], { revalidate: false });
    return created;
  }

  async function updateContact(id: number, input: ContactInput) {
    if (!token) throw new Error("Not signed in");
    const updated = await apiRequest<Contact>(`/api/contacts/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    await result.mutate(
      (current = []) => current.map((contact) => (contact.id === id ? updated : contact)),
      { revalidate: false },
    );
    return updated;
  }

  async function deleteContact(id: number) {
    if (!token) throw new Error("Not signed in");
    await apiRequest<{ id: number }>(`/api/contacts/${id}`, token, { method: "DELETE" });
    await result.mutate((current = []) => current.filter((contact) => contact.id !== id), {
      revalidate: false,
    });
  }

  return { ...result, createContact, updateContact, deleteContact };
}

