import { z } from "zod";

export const CreateRentalRequestSchema = z
  .object({
    rent_monthly: z.number(),
    start_year_month: z.string().min(1),
    end_year_month: z.string().min(1).nullable().optional(),
  })
  .strict();

export type CreateRentalRequest = z.infer<typeof CreateRentalRequestSchema>;
