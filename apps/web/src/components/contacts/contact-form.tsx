"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ApiFailure } from "@/lib/api";
import { contactFormSchema, prepareContactPayload, type ContactFormValues } from "@/lib/contacts";
import type { Contact, ContactInput } from "@/lib/types";

const emptyValues: ContactFormValues = {
  name: "",
  company: "",
  role: "",
  where_met: "",
  notes: "",
  priority: "medium",
};

function valuesForContact(contact: Contact | null): ContactFormValues {
  if (!contact) return emptyValues;
  return {
    name: contact.name,
    company: contact.company ?? "",
    role: contact.role ?? "",
    where_met: contact.where_met ?? "",
    notes: contact.notes ?? "",
    priority: contact.priority,
  };
}

export function ContactForm({
  contact,
  onSave,
}: {
  contact: Contact | null;
  onSave: (input: ContactInput) => Promise<void>;
}) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: valuesForContact(contact),
  });
  const notes = useWatch({ control: form.control, name: "notes" });

  useEffect(() => {
    form.reset(valuesForContact(contact));
  }, [contact, form]);

  async function submit(values: ContactFormValues) {
    try {
      await onSave(prepareContactPayload(values));
    } catch (error) {
      if (error instanceof ApiFailure && error.fieldErrors) {
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          if (field in emptyValues && messages?.[0]) {
            form.setError(field as FieldPath<ContactFormValues>, { message: messages[0] });
          }
        }
        return;
      }
      form.setError("root", { message: error instanceof Error ? error.message : "Could not save contact" });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="flex-1 space-y-5 overflow-y-auto py-2 pr-1">
        <Field label="Name" htmlFor="contact-name" error={form.formState.errors.name?.message}>
          <Input id="contact-name" autoFocus placeholder="Maya Chen" maxLength={100} aria-invalid={Boolean(form.formState.errors.name)} {...form.register("name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" htmlFor="contact-company" error={form.formState.errors.company?.message}>
            <Input id="contact-company" placeholder="Acme Labs" maxLength={100} {...form.register("company")} />
          </Field>
          <Field label="Role" htmlFor="contact-role" error={form.formState.errors.role?.message}>
            <Input id="contact-role" placeholder="Product lead" maxLength={100} {...form.register("role")} />
          </Field>
        </div>
        <Field label="Where you met" htmlFor="contact-where-met" error={form.formState.errors.where_met?.message}>
          <Input id="contact-where-met" placeholder="Berkeley alumni panel" maxLength={200} {...form.register("where_met")} />
        </Field>
        <Field label="Priority" htmlFor="contact-priority" error={form.formState.errors.priority?.message}>
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="contact-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field label="Notes" htmlFor="contact-notes" error={form.formState.errors.notes?.message} hint={`${notes.length.toLocaleString()} / 2,000`}>
          <Textarea id="contact-notes" rows={7} placeholder="What mattered in the conversation? What should happen next?" maxLength={2000} {...form.register("notes")} />
        </Field>
        {form.formState.errors.root ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{form.formState.errors.root.message}</p> : null}
      </div>
      <SheetFooter className="border-t bg-background pt-5">
        <SheetClose asChild><Button type="button" variant="outline">Cancel</Button></SheetClose>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
          {contact ? "Save changes" : "Add contact"}
        </Button>
      </SheetFooter>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
