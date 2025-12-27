import { z } from "zod";

const UpdateSimulationSettingsPatchSchema = z
  .object({
    start_offset_months: z.number(),
    end_age: z.number(),
    pension_amount_single: z.number(),
    pension_amount_spouse: z.number(),
    mortgage_transaction_cost_rate: z.number(),
    real_estate_tax_rate: z.number(),
    real_estate_evaluation_rate: z.number(),
  })
  .partial()
  .strict();

export const UpdateSimulationSettingsRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateSimulationSettingsPatchSchema,
  })
  .strict();

export type UpdateSimulationSettingsRequest = z.infer<typeof UpdateSimulationSettingsRequestSchema>;
