"use client";

import { Building2, MapPin, Pencil, Trash2 } from "lucide-react";

import { PriorityBadge } from "@/components/contacts/priority-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Contact } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

export function ContactList({ contacts, onEdit, onDelete }: { contacts: Contact[]; onEdit: (contact: Contact) => void; onDelete: (contact: Contact) => void }) {
  return (
    <>
      <Card className="hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Person</TableHead><TableHead>Where you met</TableHead><TableHead>Priority</TableHead><TableHead>Updated</TableHead><TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <p className="font-semibold text-foreground">{contact.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{[contact.role, contact.company].filter(Boolean).join(" at ") || "No role or company yet"}</p>
                </TableCell>
                <TableCell className="max-w-xs"><p className="truncate">{contact.where_met ?? "Not recorded"}</p>{contact.notes ? <p className="mt-1 truncate text-xs text-muted-foreground">{contact.notes}</p> : null}</TableCell>
                <TableCell><PriorityBadge priority={contact.priority} /></TableCell>
                <TableCell className="text-muted-foreground">{dateFormatter.format(new Date(contact.updated_at))}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(contact)} aria-label={`Edit ${contact.name}`}><Pencil /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(contact)} aria-label={`Delete ${contact.name}`} className="text-destructive hover:text-destructive"><Trash2 /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="grid gap-3 md:hidden">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-serif text-xl font-semibold">{contact.name}</p><p className="mt-1 text-sm text-muted-foreground">{contact.role ?? "Role not recorded"}</p></div>
                <PriorityBadge priority={contact.priority} />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-4" />{contact.company ?? "Company not recorded"}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" />{contact.where_met ?? "Meeting context not recorded"}</p>
              </div>
              {contact.notes ? <p className="mt-4 line-clamp-3 rounded-md bg-muted p-3 text-sm leading-6">{contact.notes}</p> : null}
              <div className="mt-5 flex gap-2 border-t pt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(contact)} aria-label={`Edit ${contact.name}`}><Pencil />Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(contact)} aria-label={`Delete ${contact.name}`}><Trash2 />Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
