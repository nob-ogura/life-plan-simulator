import { z } from "zod";

const UpdateRentalPatchSchema = z
  .object({
    rent_monthly: z.number(),
    start_year_month: z.string().min(1),
    end_year_month: z.string().min(1).nullable().optional(),
  })
  .partial()
  .strict();

export const UpdateRentalRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateRentalPatchSchema,
  })
  .strict();

export type UpdateRentalRequest = z.infer<typeof UpdateRentalRequestSchema>;
