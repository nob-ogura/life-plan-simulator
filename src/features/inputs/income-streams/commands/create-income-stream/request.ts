import { z } from "zod";

export const CreateIncomeStreamRequestSchema = z
  .object({
    label: z.string().min(1),
    take_home_monthly: z.number(),
    bonus_months: z.array(z.number()).optional(),
    bonus_amount: z.number(),
    change_year_month: z.string().min(1).nullable().optional(),
    bonus_amount_after: z.number().nullable().optional(),
    raise_rate: z.number().optional(),
    start_year_month: z.string().min(1),
    end_year_month: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreateIncomeStreamRequest = z.infer<typeof CreateIncomeStreamRequestSchema>;
