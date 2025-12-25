import { z } from "zod";

const UpdateIncomeStreamPatchSchema = z
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
  .partial()
  .strict();

export const UpdateIncomeStreamRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateIncomeStreamPatchSchema,
  })
  .strict();

export type UpdateIncomeStreamRequest = z.infer<typeof UpdateIncomeStreamRequestSchema>;
