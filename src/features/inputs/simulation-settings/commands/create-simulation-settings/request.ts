import { z } from "zod";

export const CreateSimulationSettingsRequestSchema = z
  .object({
    start_offset_months: z.number().optional(),
    end_age: z.number(),
    pension_amount_single: z.number().optional(),
    pension_amount_spouse: z.number().optional(),
    mortgage_transaction_cost_rate: z.number().optional(),
    real_estate_tax_rate: z.number().optional(),
    real_estate_evaluation_rate: z.number().optional(),
  })
  .strict();

export type CreateSimulationSettingsRequest = z.infer<typeof CreateSimulationSettingsRequestSchema>;
