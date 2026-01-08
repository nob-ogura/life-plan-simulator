import { z } from "zod";

import {
  arrayWithDefault,
  optionalNumericString,
  optionalYearMonth,
  requiredNumericString,
} from "@/features/inputs/shared/form-utils";
import { VALIDATION_MESSAGES } from "@/features/inputs/shared/validation-messages";

const requiredString = z.string().trim().min(1, { message: VALIDATION_MESSAGES.REQUIRED });

const bonusMonthsSchema = z
  .array(
    z
      .number({ error: VALIDATION_MESSAGES.NUMERIC })
      .int({ message: VALIDATION_MESSAGES.INTEGER })
      .min(1, { message: VALIDATION_MESSAGES.MONTH_RANGE_1_12 })
      .max(12, { message: VALIDATION_MESSAGES.MONTH_RANGE_1_12 }),
  )
  .optional();

const BonusStreamSchema = z.object({
  id: z.string().optional(),
  label: requiredString,
  bonus_months: bonusMonthsSchema,
  bonus_amount: requiredNumericString,
  change_year_month: optionalYearMonth,
  bonus_amount_after: optionalNumericString,
});

export const BonusSectionSchema = z.object({
  streams: arrayWithDefault(BonusStreamSchema),
});

export type BonusSectionInput = z.input<typeof BonusSectionSchema>;
export type BonusSectionPayload = z.output<typeof BonusSectionSchema>;
