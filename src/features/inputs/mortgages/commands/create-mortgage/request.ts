import { z } from "zod";

export const CreateMortgageRequestSchema = z
  .object({
    principal: z.number(),
    annual_rate: z.number().optional(),
    years: z.number(),
    start_year_month: z.string().min(1),
    building_price: z.number(),
    land_price: z.number(),
    down_payment: z.number(),
    target_rental_id: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreateMortgageRequest = z.infer<typeof CreateMortgageRequestSchema>;
