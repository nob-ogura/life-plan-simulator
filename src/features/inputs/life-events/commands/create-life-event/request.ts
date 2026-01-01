import { z } from "zod";
import {
  LIFE_EVENT_CATEGORY_VALUES,
  type LifeEventCategory,
} from "@/shared/domain/life-events/categories";

const lifeEventCategorySchema: z.ZodType<LifeEventCategory> = z.enum(LIFE_EVENT_CATEGORY_VALUES);

export const CreateLifeEventRequestSchema = z
  .object({
    label: z.string().min(1),
    amount: z.number(),
    year_month: z.string().min(1),
    repeat_interval_years: z.number().nullable().optional(),
    stop_after_age: z.number().nullable().optional(),
    stop_after_occurrences: z.number().nullable().optional(),
    category: lifeEventCategorySchema,
    auto_toggle_key: z.string().min(1).nullable().optional(),
    building_price: z.number().nullable().optional(),
    land_price: z.number().nullable().optional(),
    down_payment: z.number().nullable().optional(),
  })
  .strict();

export type CreateLifeEventRequest = z.infer<typeof CreateLifeEventRequestSchema>;
