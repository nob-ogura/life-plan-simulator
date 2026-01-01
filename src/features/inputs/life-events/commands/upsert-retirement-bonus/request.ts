import { z } from "zod";
import type { LifeEventCategory } from "@/shared/domain/life-events/categories";

const retirementBonusCategorySchema = z.literal(
  "retirement_bonus",
) satisfies z.ZodType<LifeEventCategory>;

export const UpsertRetirementBonusRequestSchema = z
  .object({
    label: z.string().min(1),
    amount: z.number(),
    year_month: z.string().min(1),
    repeat_interval_years: z.number().nullable().optional(),
    stop_after_age: z.number().nullable().optional(),
    stop_after_occurrences: z.number().nullable().optional(),
    category: retirementBonusCategorySchema,
    auto_toggle_key: z.string().min(1).nullable().optional(),
    building_price: z.number().nullable().optional(),
    land_price: z.number().nullable().optional(),
    down_payment: z.number().nullable().optional(),
  })
  .strict();

export type UpsertRetirementBonusRequest = z.infer<typeof UpsertRetirementBonusRequestSchema>;
