import { z } from "zod";

const UpdateExpensePatchSchema = z
  .object({
    label: z.string().min(1),
    amount_monthly: z.number(),
    inflation_rate: z.number().optional(),
    category: z.string().min(1),
    start_year_month: z.string().min(1),
    end_year_month: z.string().min(1).nullable().optional(),
  })
  .partial()
  .strict();

export const UpdateExpenseRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateExpensePatchSchema,
  })
  .strict();

export type UpdateExpenseRequest = z.infer<typeof UpdateExpenseRequestSchema>;
