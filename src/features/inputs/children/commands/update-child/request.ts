import { z } from "zod";

const UpdateChildPatchSchema = z
  .object({
    label: z.string().min(1),
    birth_year_month: z.string().min(1).nullable().optional(),
    due_year_month: z.string().min(1).nullable().optional(),
    note: z.string().min(1).nullable().optional(),
  })
  .partial()
  .strict();

export const UpdateChildRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateChildPatchSchema,
  })
  .strict();

export type UpdateChildRequest = z.infer<typeof UpdateChildRequestSchema>;
