import { z } from "zod";

export const CreateExpenseRequestSchema = z
  .object({
    label: z.string().min(1),
    amount_monthly: z.number(),
    inflation_rate: z.number().optional(),
    category: z.string().min(1),
    start_year_month: z.string().min(1),
    end_year_month: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreateExpenseRequest = z.infer<typeof CreateExpenseRequestSchema>;
