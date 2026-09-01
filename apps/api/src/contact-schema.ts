import { z } from "zod";

export const priorities = ["high", "medium", "low"] as const;
export const prioritySchema = z.enum(priorities);

const requiredName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be 100 characters or fewer");

const optionalText = (maximum: number, label: string) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must be ${maximum.toLocaleString()} characters or fewer`)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional();

export const createContactSchema = z.object({
  name: requiredName,
  company: optionalText(100, "Company"),
  role: optionalText(100, "Role"),
  where_met: optionalText(200, "Where met"),
  notes: optionalText(2000, "Notes"),
  priority: prioritySchema.default("medium"),
});

export const updateContactSchema = z
  .object({
    name: requiredName.optional(),
    company: optionalText(100, "Company"),
    role: optionalText(100, "Role"),
    where_met: optionalText(200, "Where met"),
    notes: optionalText(2000, "Notes"),
    priority: prioritySchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one editable field is required",
  });

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export function zodFieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

