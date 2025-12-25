import { z } from "zod";

export const CreateChildRequestSchema = z
  .object({
    label: z.string().min(1),
    birth_year_month: z.string().min(1).nullable().optional(),
    due_year_month: z.string().min(1).nullable().optional(),
    note: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreateChildRequest = z.infer<typeof CreateChildRequestSchema>;
