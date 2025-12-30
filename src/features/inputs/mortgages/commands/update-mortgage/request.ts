import { z } from "zod";

const UpdateMortgagePatchSchema = z
  .object({
    principal: z.number(),
    annual_rate: z.number().optional(),
    years: z.number(),
    start_year_month: z.string().min(1),
    building_price: z.number(),
    land_price: z.number(),
    down_payment: z.number(),
  })
  .partial()
  .strict();

export const UpdateMortgageRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateMortgagePatchSchema,
  })
  .strict();

export type UpdateMortgageRequest = z.infer<typeof UpdateMortgageRequestSchema>;
