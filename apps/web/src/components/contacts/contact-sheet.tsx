"use client";

import { ContactForm } from "@/components/contacts/contact-form";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Contact, ContactInput } from "@/lib/types";

export function ContactSheet({
  open,
  contact,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  contact: Contact | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: ContactInput) => Promise<void>;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="pr-8">
          <SheetTitle>{contact ? "Edit contact" : "Add a contact"}</SheetTitle>
          <SheetDescription>{contact ? "Update the details that help you remember this relationship." : "Capture enough context to make the next conversation easier."}</SheetDescription>
        </SheetHeader>
        <ContactForm contact={contact} onSave={onSave} />
      </SheetContent>
    </Sheet>
  );
}

