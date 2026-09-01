"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { ContactList } from "@/components/contacts/contact-list";
import { ContactSheet } from "@/components/contacts/contact-sheet";
import { ContactEmpty, ContactError, ContactLoading } from "@/components/contacts/contact-states";
import { ContactToolbar } from "@/components/contacts/contact-toolbar";
import { DeleteContactDialog } from "@/components/contacts/delete-contact-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/use-contacts";
import { filterAndSortContacts } from "@/lib/contacts";
import { neon, sessionToken, type SessionData } from "@/lib/neon";
import type { Contact, ContactInput, ContactSort, PriorityFilter } from "@/lib/types";

export function ContactsDashboard() {
  const router = useRouter();
  const session = neon.auth.useSession();
  const token = sessionToken(session.data);
  const user = (session.data as SessionData | null)?.user;
  const contacts = useContacts(token);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [sort, setSort] = useState<ContactSort>("recent");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<Contact | null>(null);

  useEffect(() => {
    if (!session.isPending && !session.data) router.replace("/sign-in");
  }, [router, session.data, session.isPending]);

  const visibleContacts = useMemo(
    () => filterAndSortContacts(contacts.data ?? [], query, priority, sort),
    [contacts.data, priority, query, sort],
  );

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setSheetOpen(true);
  }

  async function save(input: ContactInput) {
    if (editing) {
      await contacts.updateContact(editing.id, input);
      toast.success(`${input.name} was updated`);
    } else {
      await contacts.createContact(input);
      toast.success(`${input.name} was added`);
    }
    setSheetOpen(false);
  }

  async function remove() {
    if (!deleting) return;
    try {
      await contacts.deleteContact(deleting.id);
      toast.success(`${deleting.name} was deleted`);
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete contact");
    }
  }

  async function signOut() {
    await neon.auth.signOut();
    router.replace("/sign-in");
  }

  if (session.isPending || (!session.data && !session.error)) {
    return <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8"><Skeleton className="h-12 w-full" /><Skeleton className="mt-16 h-64 w-full" /></main>;
  }

  if (!session.data || !token) return null;

  const allContacts = contacts.data ?? [];
  const highPriorityCount = allContacts.filter((contact) => contact.priority === "high").length;
  const isFiltered = Boolean(query.trim()) || priority !== "all";

  return (
    <main className="min-h-screen pb-16">
      <header className="border-b bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/contacts" className="flex items-center gap-3 font-semibold"><span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><UsersRound className="size-5" /></span><span className="hidden sm:inline">Network Keeper</span></Link>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user?.name || "Your network"}</p><p className="text-xs text-muted-foreground">{user?.email}</p></div>
            <Button variant="ghost" size="icon" onClick={() => void signOut()} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 px-5 py-8 sm:px-8 sm:py-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary"><ShieldCheck className="size-4" />Private workspace</div><h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Your people</h1><p className="mt-3 text-muted-foreground">Keep the context. Make the follow-up count.</p></div>
          <Button size="lg" onClick={openCreate}><Plus />Add contact</Button>
        </section>

        <section className="grid gap-3 sm:grid-cols-3" aria-label="Contact summary">
          <Summary label="Total contacts" value={allContacts.length} />
          <Summary label="High priority" value={highPriorityCount} />
          <Summary label="Showing now" value={visibleContacts.length} />
        </section>

        <ContactToolbar query={query} priority={priority} sort={sort} onQueryChange={setQuery} onPriorityChange={setPriority} onSortChange={setSort} />

        {contacts.isLoading ? <ContactLoading /> : contacts.error ? <ContactError message={contacts.error instanceof Error ? contacts.error.message : "Unknown error"} onRetry={() => void contacts.mutate()} /> : visibleContacts.length === 0 ? <ContactEmpty filtered={isFiltered} onAdd={openCreate} /> : <ContactList contacts={visibleContacts} onEdit={openEdit} onDelete={setDeleting} />}
      </div>

      <ContactSheet open={sheetOpen} contact={editing} onOpenChange={setSheetOpen} onSave={save} />
      <DeleteContactDialog contact={deleting} open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} onDelete={remove} />
    </main>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return <Card className="bg-card/90"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-serif text-3xl font-semibold text-primary">{value}</p></CardContent></Card>;
}

