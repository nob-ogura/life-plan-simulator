import { z } from "zod";

const UpdateLifeEventPatchSchema = z
  .object({
    label: z.string().min(1),
    amount: z.number(),
    year_month: z.string().min(1),
    repeat_interval_years: z.number().nullable().optional(),
    stop_after_age: z.number().nullable().optional(),
    stop_after_occurrences: z.number().nullable().optional(),
    category: z.string().min(1),
    auto_toggle_key: z.string().min(1).nullable().optional(),
    building_price: z.number().nullable().optional(),
    land_price: z.number().nullable().optional(),
    down_payment: z.number().nullable().optional(),
  })
  .partial()
  .strict();

export const UpdateLifeEventRequestSchema = z
  .object({
    id: z.string().min(1),
    patch: UpdateLifeEventPatchSchema,
  })
  .strict();

export type UpdateLifeEventRequest = z.infer<typeof UpdateLifeEventRequestSchema>;
