"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Contact } from "@/lib/types";

export function DeleteContactDialog({
  contact,
  open,
  onOpenChange,
  onDelete,
}: {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirm() {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {contact?.name ?? "this contact"}?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes the contact and its notes. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Keep contact</AlertDialogCancel>
          <AlertDialogAction onClick={(event) => { event.preventDefault(); void confirm(); }} disabled={isDeleting}>
            {isDeleting ? <LoaderCircle className="animate-spin" /> : null}
            Delete contact
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

